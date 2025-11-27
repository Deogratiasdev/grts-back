import db from './db.js';
import crypto from 'crypto';

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

    // Table des administrateurs
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email_encrypted TEXT NOT NULL UNIQUE,
        email_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )
    `);

    console.log('✅ Base de données initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Fonction pour chiffrer un email
export function encryptEmail(email) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  );
  let encrypted = cipher.update(email, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// Fonction pour hacher un email (pour les recherches)
export function hashEmail(email) {
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase() + process.env.EMAIL_SALT)
    .digest('hex');
}

// Fonction pour décrypter un email
export function decryptEmail(encryptedEmail) {
  try {
    const [ivHex, encrypted] = encryptedEmail.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Erreur lors du décryptage de l\'email:', error);
    return null;
  }
}
