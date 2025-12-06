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
    
    // Envoyer une notification à l'email de contact configuré
    const contactEmail = process.env.CONTACT_EMAIL || 'gratiashounnou@gmail.com';
    if (contactEmail) {
      try {
        logger.debug(`[${requestId}] Envoi d'une notification à l'email de contact: ${contactEmail}`);
        
        const currentDate = new Date().toLocaleString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        await sendEmail({
          to: contactEmail,
          subject: `📧 Nouveau message de ${prenom || 'un visiteur'} - ${projet ? projet.substring(0, 30) + (projet.length > 30 ? '...' : '') : 'Sans objet'}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="padding: 20px; text-align: center; border-bottom: 2px solid #ff6b35; background-color: #fff8f0;">
                <h1 style="margin: 0; color: #e65100; font-weight: 600;">Nouveau message de contact</h1>
                <p style="margin: 8px 0 0; color: #ff6b35; font-size: 0.95em;">${currentDate}</p>
              </div>
              
              <div style="padding: 20px;">
                <h2 style="color: #e65100; margin: 0 0 20px 0; font-size: 1.3em; display: flex; align-items: center; gap: 8px;">
                  <i class="fas fa-user-circle"></i> Informations du contact
                </h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tbody>
                    ${prenom ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 120px;"><strong>Prénom :</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${prenom}</td></tr>` : ''}
                    ${nom ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Nom :</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${nom}</td></tr>` : ''}
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email :</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                        <a href="mailto:${email}" style="color: #4a6fa5; text-decoration: none;">${email}</a>
                      </td>
                    </tr>
                    ${telephone ? `
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Téléphone :</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                        <a href="tel:${telephone}" style="color: #4a6fa5; text-decoration: none;">${telephone}</a>
                        ${whatsapp ? ' <span style="background-color: #25D366; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em; margin-left: 5px;">WhatsApp</span>' : ''}
                      </td>
                    </tr>` : ''}
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date :</strong></td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${currentDate}</td>
                    </tr>
                  </tbody>
                </table>

                <h3 style="color: #e65100; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 1px solid #ffe0b2; display: flex; align-items: center; gap: 8px;">
                  <i class="fas fa-folder-open"></i> Détails du projet
                </h3>
                <div style="padding: 0 0 20px 0; margin-bottom: 20px; border-bottom: 1px solid #f5f5f5; line-height: 1.7;">
                  ${projet ? projet.replace(/\n/g, '<br>') : 'Aucune description fournie'}
                </div>

                <!-- Section Répondre au visiteur -->
                <div style="margin: 30px 0; padding: 20px; background-color: #fff8f0; border-radius: 8px; border: 1px solid #ffe0b2;">
                  <h3 style="margin-top: 0; color: #e65100; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-reply" style="color: #e65100;"></i> Répondre au visiteur
                  </h3>
                  <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 15px;">
                    <a href="https://wa.me/${telephone ? telephone.replace(/[^0-9+]/g, '') : '+22900000000'}${telephone ? `?text=${encodeURIComponent(`Bonjour ${prenom || nom ? `Monsieur${nom ? ' ' + nom.toUpperCase() : ''}${prenom ? ' ' + prenom : ''}` : 'Madame, Monsieur'},\n\nJe vous écris car j'ai reçu votre message concernant "${objet || 'votre demande'}".\n\nCordialement,`)}` : ''}" 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background-color: #25D366; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: all 0.2s ease; opacity: ${telephone ? '1' : '0.7'};"
                       ${!telephone ? 'disabled title="Numéro de téléphone non fourni"' : ''}>
                      <i class="fab fa-whatsapp" style="font-size: 1.2em;"></i>
                      ${telephone ? 'Discuter sur WhatsApp' : 'WhatsApp non disponible'}
                    </a>
                    
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(objet || 'Votre demande')}&body=Bonjour ${prenom || nom ? `Monsieur${nom ? ' ' + nom.toUpperCase() : ''}${prenom ? ' ' + prenom : ''}` : 'Madame, Monsieur'},%0D%0A%0D%0AJe vous écris car j'ai reçu votre message concernant "${encodeURIComponent(objet || 'votre demande')}".%0D%0A%0D%0ACordialement," 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: all 0.2s ease;">
                      <i class="fas fa-envelope" style="font-size: 1.1em;"></i>
                      Répondre par email
                    </a>
                  </div>
                  <p style="margin: 12px 0 0 0; font-size: 0.9em; color: #666;">
                    <strong>Téléphone :</strong> 
                    ${telephone ? `
                      <a href="tel:${telephone}" style="color: #ff6b35; text-decoration: none;">${telephone}</a>
                      ${whatsapp ? '<span style="background-color: #25D366; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em; margin-left: 5px;">WhatsApp activé</span>' : ''}
                    ` : 'Non fourni'}
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 0.9em; color: #e65100;">
                    <strong>Email :</strong> 
                    <a href="mailto:${email}" style="color: #ff6b35; text-decoration: none;">${email}</a>
                  </p>
                </div>

                <div style="margin-top: 40px; padding: 20px 0; border-top: 1px solid #ffe0b2; text-align: center; color: #ff6b35; font-size: 0.85em; background-color: #fff8f0; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px 0;">Ce message a été envoyé depuis le formulaire de contact de votre site web.</p>
                  <p style="margin: 0;">© ${new Date().getFullYear()} Tous droits réservés</p>
                </div>
              </div>
            </div>
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
