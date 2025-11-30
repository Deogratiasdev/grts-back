import { initializeDatabase } from './src/config/db-init.js';

async function main() {
  try {
    console.log('🚀 Initialisation de la base de données...');
    await initializeDatabase();
    console.log('✅ Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

main();
