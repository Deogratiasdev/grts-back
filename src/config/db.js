import { createClient } from '@libsql/client';

// Configuration pour SQLite local
const config = {
  url: process.env.TURSO_DB_URL || 'file:./database.sqlite',
};

// Si nous avons un token, l'ajouter à la configuration
if (process.env.TURSO_DB_TOKEN && process.env.TURSO_DB_TOKEN !== 'local') {
  config.authToken = process.env.TURSO_DB_TOKEN;
}

console.log('Configuration de la base de données:', {
  url: config.url,
  hasAuthToken: !!config.authToken
});

const db = createClient(config);

export default db;
