// Stockage en mémoire pour le rate limiting
export const rateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // 10 requêtes max par fenêtre

/**
 * Réinitialise le compteur de rate limit pour une IP spécifique ou pour toutes les IPs
 * @param {string} [ip] - L'IP à réinitialiser (optionnel, si non fourni, réinitialise tout)
 * @returns {Object} - Résultat de l'opération
 */
export const resetRateLimit = (ip) => {
  if (ip) {
    // Réinitialiser pour une IP spécifique
    if (rateLimits.has(ip)) {
      rateLimits.delete(ip);
      return { success: true, message: `Rate limit réinitialisé pour l'IP: ${ip}` };
    }
    return { success: false, message: `Aucune entrée trouvée pour l'IP: ${ip}` };
  }
  
  // Réinitialiser pour toutes les IPs
  const count = rateLimits.size;
  rateLimits.clear();
  return { 
    success: true, 
    message: `Tous les rate limits ont été réinitialisés (${count} IP(s) affectée(s))` 
  };
};

const rateLimitMiddleware = async (c, next) => {
  const now = Date.now();
  
  // Vérifier si c.req est défini avant d'accéder aux headers
  let ip = 'unknown';
  if (c && c.req && c.req.header) {
    ip = c.req.header('x-forwarded-for') || 
         c.req.header('x-real-ip') || 
         (c.req.raw && c.req.raw.socket && c.req.raw.socket.remoteAddress) ||
         'unknown';
  }
  
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    const rateLimit = rateLimits.get(ip);
    
    if (now > rateLimit.resetAt) {
      // Réinitialiser le compteur si la fenêtre est expirée
      rateLimit.count = 1;
      rateLimit.resetAt = now + RATE_LIMIT_WINDOW_MS;
    } else if (rateLimit.count >= RATE_LIMIT_MAX) {
      // Bloquer la requête si la limite est atteinte
      c.status(429);
      return c.json({ error: 'Trop de requêtes, veuillez réessayer plus tard.' });
    } else {
      // Incrémenter le compteur
      rateLimit.count++;
    }
  }
  
  // Nettoyer les anciennes entrées (pour éviter une fuite de mémoire)
  for (const [ip, data] of rateLimits.entries()) {
    if (now > data.resetAt + RATE_LIMIT_WINDOW_MS * 2) {
      rateLimits.delete(ip);
    }
  }
  
  await next();
};

export default rateLimitMiddleware;
