import { Hono } from 'hono';
import { requestAdminLogin, verifyAdminCode } from '../controllers/adminController.js';
import rateLimit from '../middlewares/rateLimit.js';

const adminRoutes = new Hono();

// Limiter les tentatives de connexion
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limite chaque IP à 5 requêtes par fenêtre
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
});

// Demande de connexion admin
adminRoutes.post('/request-login', loginLimiter, requestAdminLogin);

// Vérification du code de vérification
adminRoutes.post('/verify-code', verifyAdminCode);

export { adminRoutes };
