import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Charger les variables d'environnement
config({ path: '.env' });

// Vérifier les variables d'environnement requises
const requiredEnvVars = ['TURSO_DB_URL', 'TURSO_DB_TOKEN'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Variables d'environnement manquantes : ${missingVars.join(', ')}`);
  console.error('Veuillez créer un fichier .env à la racine du dossier server avec les variables requises :');
  console.log('TURSO_DB_URL=votre_url_de_base_de_donnees');
  console.log('TURSO_DB_TOKEN=votre_token_d_acces');
  process.exit(1);
}

// Initialiser le client Turso
const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN
});

async function resetDatabase() {
  try {
    console.log('🚀 Connexion à la base de données Turso...');
    
    // Vérifier la connexion
    await db.execute('SELECT 1');
    
    console.log('🗑️  Suppression des tables existantes...');
    
    // Désactiver les clés étrangères (si supporté)
    try {
      await db.execute('PRAGMA foreign_keys = OFF');
    } catch (e) {
      console.log('ℹ️  PRAGMA foreign_keys non supporté, continuation...');
    }
    
    // Supprimer les tables existantes
    await db.execute('DROP TABLE IF EXISTS contacts');
    await db.execute('DROP TABLE IF EXISTS admins');
    
    console.log('✅ Tables supprimées avec succès');
    
    // Réinitialiser la base de données
    console.log('🔄 Création de la nouvelle structure...');
    const { initializeDatabase } = await import('../src/config/db-init.js');
    await initializeDatabase();
    
    console.log('✅ Base de données réinitialisée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation de la base de données:');
    console.error(error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  } finally {
    // Fermer la connexion à la base de données
    if (db) {
      await db.close();
      console.log('🔌 Connexion à la base de données fermée');
    }
    process.exit(0);
  }
}

resetDatabase();
