import db from './db.js';

// Fonction pour initialiser la base de données
export async function initializeDatabase() {
  try {
    // Table des contacts avec UUID
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        prenom TEXT,
        nom TEXT,
        email TEXT NOT NULL UNIQUE,
        telephone TEXT,
        projet TEXT NOT NULL,
        whatsapp BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_email FOREIGN KEY (email) REFERENCES contacts(email) ON DELETE CASCADE
      )
    `);

    await db.execute('CREATE INDEX IF NOT EXISTS idx_auth_token ON auth_tokens(token)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_auth_email ON auth_tokens(email)');

    logger.info('Base de données initialisée avec succès');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données', error);
    throw error;
  }
}
