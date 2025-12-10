import { startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import db from '../config/db.js';
import { sendEmail } from './emailService.js';
import generateWeeklyReportEmail from '../templates/weeklyReportTemplate.js';

/**
 * Récupère les clients de la semaine en cours
 * @returns {Promise<Array>} Liste des clients de la semaine
 */
async function getWeeklyClients() {
  try {
    const today = new Date();
    const startDate = startOfWeek(today, { locale: fr });
    const endDate = endOfWeek(today, { locale: fr });

    const [rows] = await db.execute(
      `SELECT * FROM contacts 
       WHERE created_at BETWEEN ? AND ? 
       ORDER BY created_at DESC`,
      [startDate.toISOString(), endDate.toISOString()]
    );

    return rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des clients de la semaine:', error);
    throw error;
  }
}


/**
 * Envoie le rapport hebdomadaire par email
 * @param {string} recipientEmail - Email du destinataire (optionnel, utilise ADMIN_EMAIL_1 par défaut)
 * @returns {Promise<Object>} Résultat de l'envoi
 */
async function sendWeeklyReport(recipientEmail = null) {
  try {
    const clients = await getWeeklyClients();
    const email = recipientEmail || process.env.ADMIN_EMAIL_1;
    
    if (!email) {
      throw new Error('Aucun email de destinataire configuré. Veuillez définir ADMIN_EMAIL_1 dans les variables d\'environnement.');
    }

    // Génération du contenu de l'email avec le template
    const { subject, html } = generateWeeklyReportEmail(clients);
    
    // Envoi de l'email
    await sendEmail({
      to: email,
      subject: subject,
      html: html
    });

    return {
      success: true,
      message: `Rapport hebdomadaire envoyé avec succès à ${email}`,
      clientsCount: clients.length
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rapport hebdomadaire:', error);
    throw error;
  }
}

export { getWeeklyClients, sendWeeklyReport };
