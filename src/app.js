import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { compress } from 'hono/compress';
import contactRoutes from './routes/contactRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { logger, httpLogger } from './utils/logger.js';
import { initializeDatabase } from './config/db-init.js';
import rateLimit from './middlewares/rateLimit.js';
import cron from 'node-cron';
import { sendWeeklyReport } from './services/weeklyReportService.js';

const app = new Hono();

// Activer la compression pour toutes les réponses
app.use('*', compress());

// Initialiser la base de données
initializeDatabase().catch(error => {
  logger.error('Failed to initialize database:', error);
  process.exit(1);
});

// Configuration des origines autorisées
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://192.168.137.1:8080',
  'http://10.18.15.76:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://10.18.15.76:3000'
].filter(Boolean);

// Middleware CORS personnalisé
app.use('*', async (c, next) => {
  const origin = c.req.header('origin');
  
  // Vérifier si l'origine est autorisée
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-request-id, x-refresh-token');
    c.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Max-Age', '86400');
  }
  
  // Répondre immédiatement aux requêtes OPTIONS
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-request-id',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
      }
    });
  }
  
  await next();
});

// Middleware de rate limiting global (sauf pour /health)
app.use('*', async (c, next) => {
  // Exclure la route /health du rate limiting
  if (c.req.path === '/health') {
    return next();
  }
  return rateLimit(c, next);
});

// Middleware de logging HTTP optimisé
app.use('*', async (c, next) => {
  const start = Date.now();
  
  try {
    await next();
    const ms = Date.now() - start;
    c.res.headers.set('X-Response-Time', `${ms}ms`);
    
    // Log de la réponse
    logger.response({
      ...c.res,
      req: c.req,
      getHeader: (name) => c.res.headers.get(name)
    }, ms);
    
  } catch (error) {
    const ms = Date.now() - start;
    logger.error(`Erreur lors du traitement de la requête ${c.req.method} ${c.req.path}`, error);
    throw error;
  }
});

// Middleware de logging des requêtes entrantes
app.use('*', async (c, next) => {
  logger.request(c.req);
  await next();
});

// Middleware de compression
app.use('*', compress());

// Gestion des erreurs globale
app.onError((err, c) => {
  const errorId = Math.random().toString(36).substring(2, 10);
  
  logger.error(`[${errorId}] Erreur non gérée: ${err.message}`, {
    error: {
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      name: err.name,
    },
    request: {
      method: c.req.method,
      url: c.req.url,
      headers: c.req.raw.headers,
    },
  });

  return c.json({ 
    success: false,
    error: 'Une erreur interne est survenue',
    errorId: process.env.NODE_ENV !== 'production' ? errorId : undefined
  }, 500);
});

// Routes de l'API
app.route('/api/contacts', contactRoutes);
app.route('/api/reports', reportRoutes);

// Planification du rapport hebdomadaire (tous les dimanches à 9h00)
if (process.env.NODE_ENV !== 'test') {
  cron.schedule('0 9 * * 0', async () => {
    try {
      const recipientEmail = process.env.ADMIN_EMAIL;
      if (recipientEmail) {
        logger.info('Démarrage du rapport hebdomadaire...');
        await sendWeeklyReport(recipientEmail);
        logger.info('Rapport hebdomadaire envoyé avec succès');
      } else {
        logger.warn('Impossible d\'envoyer le rapport hebdomadaire: ADMIN_EMAIL non configuré');
      }
    } catch (error) {
      logger.error('Erreur lors de l\'envoi du rapport hebdomadaire:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });
  
  logger.info('Tâche planifiée: rapport hebdomadaire configuré pour s\'exécuter tous les dimanches à 9h00');
}

// Route API racine

// Route pour soumettre le formulaire
// Le rate limiting est maintenant géré au niveau global de l'application
// app.post('/contact', rateLimit, contactValidator, submitContactForm);

// Route de santé (non soumise au rate limiting)
app.get('/health', (c) => {
  return c.json({ 
    s: '',
  });
});

// Route par défaut
app.get('/', (c) => {
  return c.json({ 
    status: 'running',
    version: '1.0.0',
    services: ['contact']
  });
});

// Gestion des routes non trouvées
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint non trouvé'
  }, 404);
});

export default app;
