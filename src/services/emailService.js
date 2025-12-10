import SibApiV3Sdk from 'sib-api-v3-sdk';

// Configuration de Brevo (Sendinblue)
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

/**
 * Envoi d'email via l'API Brevo (Sendinblue)
 * @param {Object} options - Les options d'envoi d'email
 * @param {string|Array|Object} options.to - Destinataire(s) de l'email
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 * @param {Object} [options.sender] - Expéditeur personnalisé
 * @returns {Promise<boolean>} - True si l'email a été envoyé avec succès
 */
const sendEmail = async ({ to, subject, html: htmlContent, sender = null }) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  
  // Formatage des destinataires
  let toList = [];
  if (typeof to === 'string') {
    toList = [{ email: to.trim() }];
  } else if (Array.isArray(to)) {
    toList = to.map(email => (typeof email === 'string' ? { email: email.trim() } : email));
  } else if (to && typeof to === 'object' && to.email) {
    toList = [{ email: to.email.trim(), name: to.name }];
  } else {
    throw new Error('Format de destinataire invalide');
  }

  // Vérification des emails valides
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = toList.filter(recipient => !emailRegex.test(recipient.email));
  
  if (invalidEmails.length > 0) {
    throw new Error(`Adresse(s) email invalide(s): ${invalidEmails.map(e => e.email).join(', ')}`);
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = toList;
  // Configuration de l'expéditeur
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'deogratiashounnou1@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'grts.pages.dev';
  
  // Vérification du format de l'email de l'expéditeur
  const senderEmailMatch = senderEmail.match(/([^<]+)<([^>]+)>/) || [null, senderName, senderEmail];
  const senderConfig = {
    email: senderEmailMatch[2] ? senderEmailMatch[2].trim() : 'noreply@grts.pages.dev',
    name: senderEmailMatch[1] ? senderEmailMatch[1].trim() : senderName
  };

  sendSmtpEmail.sender = sender || senderConfig;
  sendSmtpEmail.subject = subject || 'Nouveau message';
  sendSmtpEmail.htmlContent = htmlContent || '';

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email envoyé avec succès:', response);
    return true;
  } catch (error) {
    console.error('Erreur détaillée de l\'API Brevo:', {
      status: error.status,
      response: error.response?.text,
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
  }
};

export { sendEmail };
