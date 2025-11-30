import { logger } from '../utils/logger.js';

// Middleware d'authentification de base
// (Conservé pour une utilisation future si nécessaire)
export const requireAuth = (req, res, next) => {
  // Vérifier si l'utilisateur est authentifié
  // (À personnaliser selon les besoins spécifiques)
  if (!req.session || !req.session.userId) {
    logger.warn('Tentative d\'accès non autorisé à une ressource protégée', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    return res.status(401).json({ 
      success: false, 
      error: 'Authentification requise' 
    });
  }
  
  next();
};
