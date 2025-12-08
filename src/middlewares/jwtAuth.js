import { jwtVerify } from 'jose';
import { logger } from '../utils/logger.js';

/**
 * Middleware pour vérifier le JWT dans le header Authorization
 */
export const verifyJWT = async (c, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Tentative d\'accès non autorisé - Token manquant ou invalide', {
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.ip,
        path: c.req.path,
        method: c.req.method
      });
      
      return c.json({ 
        success: false, 
        error: 'Token d\'authentification manquant ou invalide' 
      }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return c.json({ 
        success: false, 
        error: 'Token d\'authentification manquant' 
      }, 401);
    }

    // Vérifier le token
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      // Vérifier si l'utilisateur a le rôle admin
      if (payload.role !== 'admin') {
        logger.warn('Tentative d\'accès non autorisé - Rôle insuffisant', {
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.ip,
          path: c.req.path,
          method: c.req.method,
          user: payload.email
        });
        
        return c.json({ 
          success: false, 
          error: 'Accès non autorisé' 
        }, 403);
      }

      // Ajouter les informations de l'utilisateur à la requête
      c.set('user', payload);
      
      // Continuer vers la prochaine fonction middleware/contrôleur
      await next();
      
    } catch (error) {
      logger.error('Erreur de vérification du token JWT:', error);
      
      if (error.name === 'JWTExpired') {
        return c.json({ 
          success: false, 
          error: 'Session expirée, veuillez vous reconnecter' 
        }, 401);
      }
      
      return c.json({ 
        success: false, 
        error: 'Token d\'authentification invalide' 
      }, 401);
    }
    
  } catch (error) {
    logger.error('Erreur dans le middleware JWT:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur d\'authentification' 
    }, 500);
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est admin
 */
export const requireAdmin = (c, next) => {
  const user = c.get('user');
  
  if (!user || user.role !== 'admin') {
    logger.warn('Tentative d\'accès non autorisé - Rôle admin requis', {
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.ip,
      path: c.req.path,
      method: c.req.method,
      user: user ? user.email : 'non authentifié'
    });
    
    return c.json({ 
      success: false, 
      error: 'Accès non autorisé' 
    }, 403);
  }
  
  return next();
};
