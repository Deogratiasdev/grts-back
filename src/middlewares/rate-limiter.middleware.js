import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Middleware de limitation de débit
 * @param {Object} options - Options de configuration
 * @param {number} options.windowMs - Durée de la fenêtre en millisecondes
 * @param {number} options.max - Nombre maximum de requêtes autorisées par fenêtre
 * @param {string} options.message - Message d'erreur personnalisé
 * @returns {Function} Middleware Express
 */
export function rateLimiter({ windowMs, max, message = 'Trop de requêtes, veuillez réessayer plus tard.' }) {
  const rateLimiter = new RateLimiterMemory({
    points: max,
    duration: Math.ceil(windowMs / 1000), // Convertir en secondes
    blockDuration: 60 * 15, // Bloquer pendant 15 minutes après dépassement
  });

  return async (c, next) => {
    try {
      const clientIP = c.req.header('x-forwarded-for') || 
                      c.req.header('x-real-ip') || 
                      c.req.header('cf-connecting-ip') ||
                      'unknown';
      
      // Utiliser l'email comme clé si disponible (pour limiter par email)
      let key = clientIP;
      
      try {
        if (c.req.method === 'POST' && 
            (c.req.path.endsWith('/auths') || c.req.path.endsWith('/verify-code'))) {
          const body = await c.req.json();
          if (body.email) {
            key += `:${body.email}`;
          }
          // Remettre le body pour qu'il puisse être lu par les middlewares suivants
          c.req.json = () => Promise.resolve(body);
        }
      } catch (error) {
        // En cas d'erreur de parsing JSON, on continue avec l'IP uniquement
        console.error('Error parsing JSON in rate limiter:', error);
      }

      const rateLimitRes = await rateLimiter.consume(key);

      // Ajouter les en-têtes de taux limite
      c.header('X-RateLimit-Limit', max);
      c.header('X-RateLimit-Remaining', rateLimitRes.remainingPoints);
      c.header('X-RateLimit-Reset', Math.ceil(rateLimitRes.msBeforeNext / 1000));

      return next();
    } catch (rateLimiterRes) {
      // Si la limite est dépassée
      c.status(429);
      return c.json({
        success: false,
        message,
        retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000)
      });
    }
  };
}

export default rateLimiter;
