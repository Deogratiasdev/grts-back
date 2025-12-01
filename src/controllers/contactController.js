import db from '../config/db.js';
import { sendEmail } from '../services/emailService.js';
import { getConfirmationEmailTemplate } from '../templates/confirmationEmail.js';
import { getAdminNotificationTemplate } from '../templates/adminNotificationEmail.js';
import { logger } from '../utils/logger.js';

// Fonction utilitaire pour valider l'email
const isValidEmail = (email) => {
  if (!email) return false;
  
  // Vérifie le format de base de l'email
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  
  // Vérifie que l'email ne commence ou ne se termine pas par un point ou un tiret
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const localPart = parts[0];
  const domainPart = parts[1];
  
  return re.test(email) && 
         !localPart.startsWith('-') && 
         !localPart.endsWith('-') &&
         !localPart.startsWith('.') && 
         !localPart.endsWith('.') &&
         !domainPart.startsWith('-') &&
         !domainPart.endsWith('-');
};

export const submitContactForm = async (c) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10);
  
  try {
    logger.debug(`[${requestId}] Nouvelle soumission de formulaire reçue`, {
      headers: c.req.raw.headers,
      ip: c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown'
    });
    
    // Récupérer les données validées
    const { prenom, nom, email, telephone, projet, whatsapp } = c.req.valid || {};
    
    logger.info(`[${requestId}] Tentative de soumission pour l'email: ${email}`);
    logger.debug(`[${requestId}] Données du formulaire:`, { 
      prenom: prenom ? '***' : 'non fourni',
      nom: nom ? '***' : 'non fourni',
      email: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'non fourni',
      telephone: telephone ? '***' : 'non fourni',
      projet: projet ? projet.substring(0, 20) + (projet.length > 20 ? '...' : '') : 'non fourni',
      whatsapp: whatsapp ? 'oui' : 'non'
    });
    
    // Vérifier si l'email existe déjà
    logger.debug(`[${requestId}] Vérification de l'existence de l'email dans la base de données`);
    const existing = await db.execute({
      sql: 'SELECT id, created_at FROM contacts WHERE email = ?',
      args: [email]
    });
    
    if (existing.rows.length > 0) {
      const submissionDate = new Date(existing.rows[0].created_at).toLocaleString('fr-FR');
      logger.warn(`[${requestId}] Tentative de soumission avec un email existant: ${email} (déjà soumis le ${submissionDate})`);
      
      return c.json({ 
        success: false,
        error: 'Un message avec cette adresse email a déjà été envoyé.',
        submissionDate: existing.rows[0].created_at
      }, 400);
    }

    // Insérer le nouveau contact avec un UUID
    logger.debug(`[${requestId}] Insertion du nouveau contact dans la base de données`);
    const contactId = crypto.randomUUID();
    
    try {
      await db.execute({
        sql: 'INSERT INTO contacts (id, prenom, nom, email, telephone, projet, whatsapp, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          contactId,
          prenom || null, 
          nom || null, 
          email, 
          telephone || null, 
          projet, 
          whatsapp ? 1 : 0, 
          new Date().toISOString()
        ]
      });
      
      logger.info(`[${requestId}] Contact inséré avec succès (ID: ${contactId})`);
    } catch (dbError) {
      logger.error(`[${requestId}] Erreur lors de l'insertion du contact`, dbError);
      throw new Error('Erreur lors de la création du contact');
    }

    // Préparer la réponse de succès
    const successResponse = { 
      success: true, 
      message: 'Votre message a été envoyé avec succès. Je vous recontacterai bientôt !',
      requestId,
      // Si WhatsApp est activé et qu'un numéro est fourni, ajouter l'URL WhatsApp
      ...(whatsapp && telephone ? {
        whatsappUrl: `https://wa.me/${telephone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent('Bonjour, je vous contacte suite à votre message sur mon portfolio.')}`
      } : {})
    };

    // Envoyer un email de confirmation au client
    if (isValidEmail(email)) {
      try {
        await sendEmail({
          to: email,
          subject: 'Confirmation de réception - ' + (projet ? projet.substring(0, 50) + (projet.length > 50 ? '...' : '') : 'Votre demande'),
          html: getConfirmationEmailTemplate({
            prenom: prenom,
            nom: nom,
            sujet: projet ? projet.substring(0, 100) + (projet.length > 100 ? '...' : '') : 'votre demande',
            message: projet
          })
        });
        logger.info(`[${requestId}] Email de confirmation envoyé avec succès à ${email}`);
        
        // Envoyer une notification à l'administrateur
        try {
          await sendEmail({
            to: process.env.ADMIN_EMAIL_1 || 'gratiashounnou@gmail.com',
            subject: `[${projet ? projet.substring(0, 30) + (projet.length > 30 ? '...' : '') : 'Nouveau message'}] ${prenom || nom ? `de ${prenom || nom}` : 'Sans nom'}`,
            html: getAdminNotificationTemplate({
              prenom,
              nom,
              email,
              telephone,
              projet,
              sujet: projet || 'Sans objet',
              whatsapp
            })
          });
          logger.info(`[${requestId}] Notification admin envoyée avec succès`);
        } catch (adminEmailError) {
          logger.error(`[${requestId}] Erreur lors de l'envoi de la notification admin:`, adminEmailError);
          // Ne pas échouer la requête si l'email admin échoue
        }
      } catch (emailError) {
        logger.error(`[${requestId}] Erreur lors de l'envoi de l'email de confirmation:`, emailError);
        // Ne pas échouer la requête si l'email échoue
      }
    } else {
      logger.warn(`[${requestId}] Email de confirmation non envoyé : adresse email invalide (${email})`);
    }
    
    // Envoyer une notification à l'email de contact configuré (si défini)
    const contactEmail = process.env.CONTACT_EMAIL;
    if (contactEmail) {
      try {
        logger.debug(`[${requestId}] Envoi d'une notification à l'email de contact: ${contactEmail}`);
        
        await sendEmail({
          to: contactEmail,
          subject: `Nouveau message de ${prenom || 'un visiteur'}`,
          html: `
            <h2>Nouveau message de contact</h2>
            <p>Vous avez reçu un nouveau message de la part de :</p>
            <ul>
              ${prenom ? `<li><strong>Prénom :</strong> ${prenom}</li>` : ''}
              ${nom ? `<li><strong>Nom :</strong> ${nom}</li>` : ''}
              <li><strong>Email :</strong> ${email}</li>
              ${telephone ? `<li><strong>Téléphone :</strong> ${telephone} ${whatsapp ? '(Disponible sur WhatsApp)' : ''}</li>` : ''}
              <li><strong>Projet :</strong> ${projet}</li>
            </ul>
            <p>Date : ${new Date().toLocaleString()}</p>
          `
        });
        
        logger.info(`[${requestId}] Notification envoyée avec succès à ${contactEmail}`);
      } catch (error) {
        logger.error(`[${requestId}] Erreur lors de l'envoi de la notification à ${contactEmail}`, {
          error: error.message,
          stack: error.stack
        });
        // Ne pas échouer la requête si l'envoi de la notification échoue
      }
    }
    
    const processingTime = Date.now() - startTime;
    logger.info(`[${requestId}] Formulaire traité avec succès en ${processingTime}ms`);
    
    return c.json(successResponse);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(`[${requestId}] Erreur lors du traitement du formulaire (${processingTime}ms)`, error);
    
    return c.json({ 
      error: 'Une erreur est survenue lors de la soumission du formulaire.',
      requestId,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, 500);
  }
};

export const healthCheck = async (c) => {
  const startTime = Date.now();
  let dbHealthy = false;
  
  try {
    // Vérifier la connexion à la base de données
    await db.execute('SELECT 1 as test');
    dbHealthy = true;
    logger.debug('Health check: Base de données accessible');
  } catch (dbError) {
    logger.error('Health check: Erreur de connexion à la base de données', dbError);
  }
  
  const status = dbHealthy ? 'healthy' : 'degraded';
  const responseTime = Date.now() - startTime;
  
  logger.info(`Health check: ${status} (${responseTime}ms)`);
  
  return c.json({ 
    status,
    timestamp: new Date().toISOString(),
    db: dbHealthy ? 'connected' : 'error',
    responseTime: `${responseTime}ms`
  });
};
