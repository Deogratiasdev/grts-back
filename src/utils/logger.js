// Niveaux de log
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// Couleurs pour la console
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Formatteur de date
const formatDate = () => {
  const now = new Date();
  return now.toISOString();
};

// Logger principal
const logger = {
  debug: (message, data = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${COLORS.blue}[${formatDate()}] ${COLORS.cyan}[DEBUG]${COLORS.reset} ${message}`, data);
    }
  },
  
  info: (message, data = '') => {
    console.log(`${COLORS.blue}[${formatDate()}] ${COLORS.green}[INFO]${COLORS.reset} ${message}`, data);
  },
  
  warn: (message, data = '') => {
    console.warn(`${COLORS.blue}[${formatDate()}] ${COLORS.yellow}[WARN]${COLORS.reset} ${message}`, data);
  },
  
  error: (message, error = null) => {
    if (error && error.stack) {
      console.error(`${COLORS.blue}[${formatDate()}] ${COLORS.red}[ERROR]${COLORS.reset} ${message}`, error);
    } else {
      console.error(`${COLORS.blue}[${formatDate()}] ${COLORS.red}[ERROR]${COLORS.reset} ${message}`, error || '');
    }
  },
  
  // Logger pour les requêtes HTTP
  request: (req) => {
    const { method, url, headers } = req;
    logger.info(`[${method}] ${url}`, {
      userAgent: headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
  },
  
  // Logger pour les réponses HTTP
  response: (res, responseTime) => {
    const { statusCode, statusMessage } = res;
    const logMessage = `[${statusCode}] ${statusMessage} (${responseTime}ms)`;
    
    if (statusCode >= 500) {
      logger.error(logMessage);
    } else if (statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  }
};

export { logger, LOG_LEVELS };
