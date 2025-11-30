import { initializeDatabase } from './src/config/db-init.js';
import db from './src/config/db.js';

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables...');
    
    // Vérifier si la table auth_tokens existe
    const tables = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='auth_tokens'"
    );
    
    console.log('Tables existantes:', tables.rows);
    
    if (tables.rows.length === 0) {
      console.log('⚠️ La table auth_tokens n\'existe pas. Tentative de création...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS auth_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table auth_tokens créée avec succès');
    } else {
      console.log('✅ La table auth_tokens existe déjà');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des tables:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // Vérifier et créer les tables si nécessaire
    await checkTables();
    
    // Initialiser la base de données
    await initializeDatabase();
    
    console.log('✅ Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

main();
