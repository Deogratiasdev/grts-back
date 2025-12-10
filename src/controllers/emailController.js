import SibApiV3Sdk from 'sib-api-v3-sdk';

// Configuration de l'API Brevo (Sendinblue)
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Fonction pour envoyer un email
export const sendEmail = async ({ to, subject, html, text = '' }) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = text;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de l\'email', {
      error: error.message,
      response: error.response?.text,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
    return { 
      success: false, 
      error: error.response?.text || error.message || 'Erreur inconnue lors de l\'envoi de l\'email' 
    };
  }
};

// Fonction pour envoyer l'email de confirmation
export const sendConfirmationEmail = async (to, name) => {
  const subject = 'Confirmation de réception de votre message';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bonjour ${name || 'Cher client'},</h2>
      <p>Nous avons bien reçu votre message et vous en remercions.</p>
      <p>Notre équipe va examiner votre demande et vous répondra dans les plus brefs délais.</p>
      <p>Cordialement,<br>L'équipe du support</p>
    </div>
  `;

  return sendEmail({ to, subject, html });
};
