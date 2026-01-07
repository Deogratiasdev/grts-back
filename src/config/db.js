import { createClient } from '@libsql/client';
import { logger } from '../utils/logger.js';

class Database {
  constructor() {
    this.client = null;
    this.isInitializing = false;
    this.config = {
      url: process.env.TURSO_DB_URL || 'file:./database.sqlite',
      timeout: 10000,  // 10 secondes
      maxRetries: 3,
      retryDelay: 1000,
      connection: {
        connectTimeout: 5000,
        requestTimeout: 5000,
        connectionTimeout: 5000,
        idleTimeout: 30000,
        keepAlive: true,
        maxConnections: 10
      }
    };

    // Ajouter le token si disponible
    if (process.env.TURSO_DB_TOKEN) {
      this.config.authToken = process.env.TURSO_DB_TOKEN;
    }

    // Initialisation non-bloquante
    this.initialize().catch(error => {
      logger.error('Échec de l\'initialisation de la base de données:', error);
    });
  }

  async initialize() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      this.client = createClient({
        url: this.config.url,
        authToken: this.config.authToken,
      });

      // Tester la connexion
      await this.client.execute('SELECT 1');
      logger.info('Connexion à la base de données établie avec succès');
    } catch (error) {
      logger.error('Erreur lors de la connexion à la base de données:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async execute(query, params = []) {
    try {
      if (!this.client) {
        await this.initialize();
      }
      return await this.client.execute(query, params);
    } catch (error) {
      logger.error('Erreur lors de l\'exécution de la requête:', { query, error });
      throw error;
    }
  }

  // Alias pour compatibilité
  async query(query, params) {
    return this.execute(query, params);
  }
}

// Créer et exporter une instance unique
export const db = new Database();
export { db as default };