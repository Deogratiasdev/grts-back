import { Hono } from 'hono';
import { cors } from 'hono/cors';
import rateLimit from '../middlewares/rateLimit.js';
import { contactValidator } from '../middlewares/validator.js';
import { 
  submitContactForm, 
  healthCheck, 
  getMetrics, 
  resetAllRateLimits 
} from '../controllers/contactController.js';

const router = new Hono();

// Middleware CORS
router.use('*', cors());

// Health check
router.get('/health', healthCheck);

// Métriques de performance
router.get('/metrics', getMetrics);

// Route pour soumettre le formulaire
router.post(
  '/contact',
  rateLimit,
  contactValidator,
  submitContactForm
);

// Route pour réinitialiser tous les rate limits
router.get('/reset-all-rate-limits', resetAllRateLimits);

export default router;
