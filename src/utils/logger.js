import pino from 'pino';
import pinoHttp from 'pino-http';

// Configuration du logger
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Options de base pour Pino
const pinoOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  transport: !isProduction ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
};

// Création du logger principal
const logger = pino(pinoOptions);

// Logger pour les requêtes HTTP
const httpLogger = pinoHttp({
  logger: logger,
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
  customLogLevel: (res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode} (${res.getHeader('x-response-time')})`;
  },
  customErrorMessage: (req, res, err) => {
    return `Erreur ${req.method} ${req.url} - ${res.statusCode} (${res.getHeader('x-response-time')}): ${err.message}`;
  },
});

// Export des fonctions de log avec signature cohérente
const log = {
  debug: (message, data = {}) => {
    if (isTest) return;
    if (typeof data === 'string') {
      logger.debug({ msg: message, context: data });
    } else {
      logger.debug({ ...data, msg: message });
    }
  },
  info: (message, data = {}) => {
    if (isTest) return;
    if (typeof data === 'string') {
      logger.info({ msg: message, context: data });
    } else {
      logger.info({ ...data, msg: message });
    }
  },
  warn: (message, data = {}) => {
    if (isTest && !process.env.TEST_LOG) return;
    if (typeof data === 'string') {
      logger.warn({ msg: message, context: data });
    } else {
      logger.warn({ ...data, msg: message });
    }
  },
  error: (message, error = null) => {
    if (isTest && !process.env.TEST_LOG) return;
    if (error instanceof Error) {
      logger.error({ err: error, msg: message });
    } else if (error) {
      logger.error({ error, msg: message });
    } else {
      logger.error({ msg: message });
    }
  },
};

// Logger HTTP
log.http = httpLogger;

// Utilitaire pour logger les requêtes
log.request = (req) => {
  const { method, url, headers } = req;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  logger.info({
    type: 'request',
    method,
    url,
    ip,
    userAgent: headers['user-agent'],
  }, `Requête entrante: ${method} ${url}`);
};

// Utilitaire pour logger les réponses
log.response = (res, responseTime) => {
  const { statusCode, req } = res;
  const { method, url } = req;

  const logData = {
    type: 'response',
    method,
    url,
    status: statusCode,
    duration: responseTime,
    responseTime: `${responseTime}ms`,
  };

  if (statusCode >= 500) {
    logger.error(logData, `Erreur serveur: ${method} ${url} - ${statusCode}`);
  } else if (statusCode >= 400) {
    logger.warn(logData, `Erreur client: ${method} ${url} - ${statusCode}`);
  } else {
    logger.info(logData, `Réponse: ${method} ${url} - ${statusCode}`);
  }
};

// Niveaux de log pour compatibilité
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

export { log as logger, LOG_LEVELS, httpLogger };
