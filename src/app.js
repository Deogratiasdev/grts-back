import { Hono } from 'hono';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { cors } from 'hono/cors';
import { initializeDatabase } from './config/db-init.js';

const app = new Hono();

// Middleware CORS global
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: true
}));

// Initialisation de la base de données
app.use('*', async (c, next) => {
  try {
    await initializeDatabase();
    await next();
  } catch (error) {
    console.error('Erreur d\'initialisation de la base de données:', error);
    return c.json({ 
      success: false,
      error: 'Erreur de base de données' 
    }, 500);
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

// Routes publiques
app.route('/api', contactRoutes);

// Routes d'administration (protégées)
app.route('/api/admin', adminRoutes);

// Route par défaut
app.get('/', (c) => {
  return c.text('API de formulaire de contact en cours d\'exécution');
});

// Gestion des routes non trouvées
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint non trouvé'
  }, 404);
});

export default app;
