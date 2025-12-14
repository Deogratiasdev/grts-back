import { Hono } from 'hono';
import AuthController from '../controllers/auth.controller.js';
import { rateLimiter } from '../middlewares/rate-limiter.middleware.js';

// Création du routeur principal pour l'API LifeAssistant
const lifeAssistantRouter = new Hono();

// Middleware de limitation de débit pour les routes d'authentification
const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite chaque IP à 5 requêtes par fenêtre
  message: 'Trop de tentatives, veuillez réessayer plus tard.'
});

// =====================================
// ROUTES D'AUTHENTIFICATION
// =====================================

/**
 * @route POST /api/lifeassistant/auths
 * @description Envoie un code de vérification à l'email fourni
 * @access Public
 */
lifeAssistantRouter.post('/auths', authRateLimiter, AuthController.sendVerificationCode);

/**
 * @route POST /api/lifeassistant/verify-code
 * @description Vérifie le code de vérification et connecte l'utilisateur
 * @access Public
 */
lifeAssistantRouter.post('/verify-code', authRateLimiter, AuthController.verifyCodeAndLogin);

/**
 * @route POST /api/lifeassistant/logout
 * @description Déconnecte l'utilisateur en supprimant sa session
 * @access Privé
 */
lifeAssistantRouter.post('/logout', AuthController.logout);

/**
 * @route GET /api/lifeassistant/check-auth
 * @description Vérifie si l'utilisateur est authentifié
 * @access Public
 */
lifeAssistantRouter.get('/check-auth', AuthController.checkAuth);

// =====================================
// ROUTES DE L'APPLICATION
// (À ajouter ici)
// =====================================

/**
 * @route GET /api/lifeassistant/me
 * @description Récupère les informations de l'utilisateur connecté
 * @access Privé
 */
lifeAssistantRouter.get('/me', async (c) => {
  // Implémentation à venir
  return c.json({ message: 'Endpoint à implémenter' });
});

export default lifeAssistantRouter;
