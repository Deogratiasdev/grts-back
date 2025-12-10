import { sendWeeklyReport } from '../services/weeklyReportService.js';

/**
 * Contrôleur pour gérer les rapports
 */
class ReportController {
  /**
   * Envoie le rapport hebdomadaire manuellement
   * @param {Object} req - Requête HTTP
   * @param {Object} res - Réponse HTTP
   */
  static async sendWeeklyReport(req, res) {
    try {
      // Récupère l'email du destinataire depuis les variables d'environnement
      const recipientEmail = process.env.ADMIN_EMAIL;
      
      if (!recipientEmail) {
        return res.status(400).json({
          success: false,
          message: "L'email de l'administrateur n'est pas configuré"
        });
      }

      const result = await sendWeeklyReport(recipientEmail);
      
      res.json({
        success: true,
        message: result.message,
        clientsCount: result.clientsCount
      });
    } catch (error) {
      logger.error('Erreur dans le contrôleur de rapport', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du rapport hebdomadaire',
        error: error.message
      });
    }
  }
}

export default ReportController;
