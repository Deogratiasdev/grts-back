import { Hono } from 'hono';
import { cors } from 'hono/cors';
import contactRoutes from './routes/contactRoutes.js';
import { requestAdminLogin, verifyToken } from './controllers/adminAuthController.js';
import { logger } from './utils/logger.js';
import { initializeDatabase } from './config/db-init.js';

const app = new Hono();

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
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  await next();
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

// Routes d'authentification admin
app.post('/admin/auths-connection', requestAdminLogin);
app.get('/api/admin/auth/verify-token', verifyToken);
app.get('/admin/auth/verify-token', verifyToken); // Ajout de la route sans le préfixe /api

// Routes de l'API
app.route('/api', contactRoutes);

// Route de santé
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
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
