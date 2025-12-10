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
    logger.debug('Création des tables si elles n\'existent pas');
    
    // Table contacts
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
const startServer = async () => {
  let server;
  
  try {
    await initializeDatabase();
    
    server = serve({
      fetch: app.fetch,
      port: PORT,
      hostname: '0.0.0.0' // Écoute sur toutes les interfaces réseau
    });

    server.on('listening', () => {
      const address = server.address();
      const host = address.address === '::' ? 'localhost' : address.address;
      logger.info(`Serveur démarré sur http://${host}:${PORT}`);
      logger.info(`Environnement: ${NODE_ENV}`);
      logger.info(`CORS autorisé pour :`);
      logger.info(`- ${process.env.FRONTEND_URL}`);
      logger.info('- http://localhost:8080');
      logger.info('- http://127.0.0.1:8080');
      logger.info('- http://192.168.137.1:8080');
    });

    // Gestion des erreurs non gérées
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Rejet non géré à la promesse:', { promise, reason });
    });

    // Gestion de l'arrêt propre
    const shutdown = async () => {
      logger.info('Arrêt du serveur en cours...');
      
      if (server) {
        server.close(() => {
          logger.info('Serveur arrêté');
          process.exit(0);
        });

        // Forcer l'arrêt après 10 secondes
        setTimeout(() => {
          logger.warn('Forçage de l\'arrêt du serveur...');
          process.exit(1);
        }, 10000);
      } else {
        process.exit(0);
      }
    };

    // Gestion des signaux d'arrêt
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    logger.error('Échec du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();
