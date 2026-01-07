import db from './db.js';
import cache from '../utils/cache.js';
import { logger } from '../utils/logger.js';

// Fonction pour initialiser la base de données
export async function initializeDatabase() {
  // Nettoyer le cache au démarrage
  try {
    cache.clearAll();
    logger.info('Cache nettoyé avec succès au démarrage');
  } catch (error) {
    logger.error('Erreur lors du nettoyage du cache au démarrage:', error);
  }
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

    // Table des utilisateurs
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des codes de vérification
    await db.execute(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des sessions utilisateur
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_agent TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Table des autorisations d'accès
    await db.execute(`
      CREATE TABLE IF NOT EXISTS autorisations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Création des index
    await db.execute('CREATE INDEX IF NOT EXISTS idx_verification_code ON verification_codes(email, code, expires_at)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_user_sessions_expiry ON user_sessions(expires_at)');

    console.log('✅ Base de données initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}
