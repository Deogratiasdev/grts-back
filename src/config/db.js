import { createClient } from '@libsql/client';

// Configuration pour SQLite local
const config = {
  url: process.env.TURSO_DB_URL || 'file:./database.sqlite',
};

// Si nous avons un token, l'ajouter à la configuration
if (process.env.TURSO_DB_TOKEN && process.env.TURSO_DB_TOKEN !== 'local') {
  config.authToken = process.env.TURSO_DB_TOKEN;
}

// Configuration de la connexion à la base de données
const db = createClient(config);

// Log de la configuration (uniquement en développement)
if (process.env.NODE_ENV !== 'production') {
  logger.debug('Configuration de la base de données', {
    url: config.url.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@'), // Masque les informations sensibles
    hasAuthToken: !!config.authToken
  });
}

export default db;
