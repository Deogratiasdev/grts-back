import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './app.js';
import db from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3000;

// Configuration de l'environnement
const NODE_ENV = process.env.NODE_ENV || 'development';
logger.info(`Démarrage du serveur en mode ${NODE_ENV}...`);

// Fonction pour initialiser la base de données
async function initializeDatabase() {
  logger.debug('Initialisation de la base de données...');
  try {
    logger.debug('Création de la table contacts si elle n\'existe pas');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prenom TEXT,
        nom TEXT,
        email TEXT NOT NULL UNIQUE,
        telephone TEXT,
        projet TEXT NOT NULL,
        whatsapp BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Base de données initialisée avec succès');
    logger.info('Base de données initialisée avec succès');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données', error);
    process.exit(1);
  }
}

// Middleware de logging des requêtes
app.use('*', async (c, next) => {
  const start = Date.now();
  const { method, url } = c.req;
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.header('cf-connecting-ip') || 'unknown';
  
  logger.info(`[${method}] ${url}`, { 
    ip,
    userAgent: c.req.header('user-agent') || 'unknown'
  });

  try {
    await next();
    const ms = Date.now() - start;
    const { status } = c.res;
    
    logger.info(`[${method}] ${url} - ${status} (${ms}ms)`);
  } catch (error) {
    const ms = Date.now() - start;
    logger.error(`[${method}] ${url} - Erreur: ${error.message} (${ms}ms)`, error);
    throw error;
  }
});

// Démarrer le serveur
async function startServer() {
  try {
    logger.info('Démarrage du serveur...');
    await initializeDatabase();

    const server = serve({
      fetch: app.fetch,
      port: PORT,
    }, (info) => {
      logger.info(`🚀 Serveur démarré sur http://localhost:${info.port}`);
      logger.info(`Environnement: ${NODE_ENV}`);
      logger.info(`Base de données: ${process.env.TURSO_DB_URL ? 'Turso DB' : 'SQLite en mémoire'}`);
      console.log(`📝 Documentation de l'API: http://localhost:${info.port}/api`);
    });

    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
      logger.error('Exception non capturée', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Rejet non géré à la promesse:', { promise, reason });
    });

    // Gestion de l'arrêt propre
    const shutdown = async () => {
      logger.info('Arrêt du serveur en cours...');
      server.close(() => {
        logger.info('Serveur arrêté');
        process.exit(0);
      });

      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        logger.warn('Forçage de l\'arrêt du serveur...');
        process.exit(1);
      }, 10000);
      console.log('✅ Serveur arrêté avec succès');
      process.exit(0);
    };

    // Gestion des signaux d'arrêt
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('❌ Échec du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();
