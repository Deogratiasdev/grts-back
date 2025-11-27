// Stockage en mémoire pour le rate limiting
const rateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // 10 requêtes max par fenêtre

const rateLimitMiddleware = async (c, next) => {
  const now = Date.now();
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  
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
