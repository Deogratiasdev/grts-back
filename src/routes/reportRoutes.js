import { Hono } from 'hono';
import ReportController from '../controllers/reportController.js';
import { rateLimiter } from '../middlewares/rateLimit.js';

const router = new Hono();

// Appliquer le rate limiting
router.use('*', rateLimiter);

/**
 * @route POST /api/reports/weekly
 * @description Déclenche l'envoi manuel du rapport hebdomadaire
 * @access Privé (devrait être protégé par authentification en production)
 */
router.post('/weekly', async (c) => {
  try {
    const result = await ReportController.sendWeeklyReport();
    return c.json(result);
  } catch (error) {
    console.error('Erreur dans la route de rapport:', error);
    return c.json({
      success: false,
      message: 'Erreur lors du traitement de la requête',
      error: error.message
    }, 500);
  }
});

export default router;
