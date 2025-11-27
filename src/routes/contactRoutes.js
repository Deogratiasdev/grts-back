import { Hono } from 'hono';
import { cors } from 'hono/cors';
import rateLimit from '../middlewares/rateLimit.js';
import { contactValidator } from '../middlewares/validator.js';
import { submitContactForm, healthCheck } from '../controllers/contactController.js';

const router = new Hono();

// Middleware CORS
router.use('*', cors());

// Health check
router.get('/health', healthCheck);

// Route pour soumettre le formulaire
router.post(
  '/contact',
  rateLimit,
  contactValidator,
  submitContactForm
);

export default router;
