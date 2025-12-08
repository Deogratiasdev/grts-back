import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { compress } from 'hono/compress';
import contactRoutes from './routes/contactRoutes.js';
import { logger } from './utils/logger.js';
import { initializeDatabase } from './config/db-init.js';
import rateLimit from './middlewares/rateLimit.js';

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

// Middleware de logging
app.use('*', async (c, next) => {
  const start = Date.now();
  const { method, path } = c.req;
  
  logger.info(`[${method}] ${path}`);
  
  try {
    await next();
    const ms = Date.now() - start;
    logger.info(`[${method}] ${path} - ${c.res.status} (${ms}ms)`);
  } catch (error) {
    const ms = Date.now() - start;
    logger.error(`[${method}] ${path} - Erreur: ${error.message} (${ms}ms)`, error);
    throw error;
  }
});

// Gestion des erreurs globale
app.onError((err, c) => {
  console.error('Erreur non gérée:', err);
  return c.json({ 
    success: false,
    error: 'Une erreur interne est survenue' 
  }, 500);
});

// Routes d'administration
app.route('/api/contact', contactRoutes);
app.route('/api', contactRoutes);

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
