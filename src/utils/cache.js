import NodeCache from 'node-cache';
import { logger } from './logger.js';

// Configuration du cache
const cacheConfig = {
  stdTTL: 60 * 15,     // 15 minutes par défaut
  checkperiod: 60,      // Vérification toutes les minutes
  deleteOnExpire: true, // Suppression automatique des entrées expirées
  useClones: false      // Meilleure performance
};

const codeCache = new NodeCache(cacheConfig);

const cache = {
  // Stocker une valeur dans le cache
  set: (key, value, ttl = 900) => {
    try {
      return codeCache.set(key, value, ttl);
    } catch (error) {
      logger.error('Erreur lors de la mise en cache:', error);
      return false;
    }
  },

  // Récupérer une valeur du cache
  get: (key) => {
    try {
      return codeCache.get(key);
    } catch (error) {
      logger.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  },

  // Supprimer une entrée du cache
  del: (key) => {
    try {
      return codeCache.del(key);
    } catch (error) {
      logger.error('Erreur lors de la suppression du cache:', error);
      return false;
    }
  },

  // Vider complètement le cache
  clearAll: () => {
    try {
      codeCache.flushAll();
      logger.info('Cache vidé avec succès');
      return true;
    } catch (error) {
      logger.error('Erreur lors du vidage du cache:', error);
      return false;
    }
  },

  // Obtenir les statistiques du cache
  getStats: () => ({
    keys: codeCache.keys().length,
    hits: codeCache.getStats().hits,
    misses: codeCache.getStats().misses,
    ksize: codeCache.getStats().ksize,
    vsize: codeCache.getStats().vsize
  })
};

export default cache;
