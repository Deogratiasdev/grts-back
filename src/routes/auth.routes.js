import { Hono } from 'hono';
import AuthController from '../controllers/auth.controller.js';
import { rateLimiter } from '../middlewares/rate-limiter.middleware.js';

const authRouter = new Hono();

// Middleware de limitation de débit pour les routes d'authentification
const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite chaque IP à 5 requêtes par fenêtre
  message: 'Trop de tentatives, veuillez réessayer plus tard.'
});

// Envoyer un code de vérification
// POST /api/lifeassistant/auths
authRouter.post('/auths', authRateLimiter, AuthController.sendVerificationCode);

// Vérifier le code et se connecter
// POST /api/lifeassistant/verify-code
authRouter.post('/verify-code', authRateLimiter, AuthController.verifyCodeAndLogin);

// Se déconnecter
// POST /api/lifeassistant/logout
authRouter.post('/logout', AuthController.logout);

// Vérifier l'état d'authentification
// GET /api/lifeassistant/check-auth
authRouter.get('/check-auth', AuthController.checkAuth);

export default authRouter;
