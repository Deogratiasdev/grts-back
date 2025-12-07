import db from '../config/db.js';
import { sendEmail } from '../services/emailService.js';
import { getConfirmationEmailTemplate } from '../templates/confirmationEmail.js';
import { logger } from '../utils/logger.js';

// Fonction pour envoyer la notification de contact
async function sendContactNotification({ prenom, nom, email, telephone, projet, requestId }) {
  const contactEmail = process.env.CONTACT_EMAIL || 'deogratiashounnou1@gmail.com';
  if (!contactEmail) return;
  
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
    
    const emailSubject = projet 
      ? `[${projet.substring(0, 30)}${projet.length > 30 ? '...' : ''}]` 
      : 'Nouveau message';
    
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
                    <span style="background-color: #25D366; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em; margin-left: 5px;">WhatsApp</span>
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
                <a href="https://wa.me/${telephone ? telephone.replace(/[^0-9+]/g, '') : '+22900000000'}${telephone ? `?text=${encodeURIComponent(`Bonjour ${prenom || nom ? `Monsieur${nom ? ' ' + nom.toUpperCase() : ''}${prenom ? ' ' + prenom : ''}` : 'Madame, Monsieur'},\n\nJe vous écris car j'ai reçu votre message concernant "${projet || 'votre demande'}".\n\nCordialement,`)}` : ''}" 
                   style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background-color: #25D366; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: all 0.2s ease; opacity: ${telephone ? '1' : '0.7'};"
                   ${!telephone ? 'disabled title="Numéro de téléphone non fourni"' : ''}>
                  <i class="fab fa-whatsapp" style="font-size: 1.2em;"></i>
                  ${telephone ? 'Discuter sur WhatsApp' : 'WhatsApp non disponible'}
                </a>
                
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(projet || 'Votre demande')}&body=Bonjour ${prenom || nom ? `Monsieur${nom ? ' ' + nom.toUpperCase() : ''}${prenom ? ' ' + prenom : ''}` : 'Madame, Monsieur'},%0D%0A%0D%0AJe vous écris car j'ai reçu votre message concernant "${encodeURIComponent(projet || 'votre demande')}".%0D%0A%0D%0ACordialement," 
                   style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: all 0.2s ease;">
                  <i class="fas fa-envelope" style="font-size: 1.1em;"></i>
                  Répondre par email
                </a>
              </div>
              <p style="margin: 12px 0 0 0; font-size: 0.9em; color: #666;">
                <strong>Téléphone :</strong> 
                ${telephone ? `
                  <a href="tel:${telephone}" style="color: #ff6b35; text-decoration: none;">${telephone}</a>
                  <span style="background-color: #25D366; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em; margin-left: 5px;">WhatsApp activé</span>
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
    throw error;
  }
}

// Configuration pour la validation d'email
const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const MIN_EMAIL_LENGTH = 5;
const AT_SYMBOL = '@';
const DOT_SYMBOL = '.';

// Cache pour la validation d'email
const emailCache = new Map();
const EMAIL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes de cache

// Validation d'email optimisée avec cache
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  
  // Vérification rapide
  if (email.length < MIN_EMAIL_LENGTH || !email.includes(AT_SYMBOL)) {
    return false;
  }

  // Vérification du cache
  const now = Date.now();
  const cached = emailCache.get(email);
  
  if (cached) {
    if (now - cached.timestamp < EMAIL_CACHE_TTL) {
      return cached.isValid;
    }
    emailCache.delete(email);
  }

  // Validation complète
  const atIndex = email.lastIndexOf(AT_SYMBOL);
  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);
  
  const isValid = (
    localPart && domainPart &&
    !localPart.endsWith(DOT_SYMBOL) &&
    !domainPart.startsWith('-') &&
    !domainPart.endsWith('-') &&
    domainPart.includes(DOT_SYMBOL) &&
    EMAIL_REGEX.test(email)
  );

  // Mettre en cache le résultat
  emailCache.set(email, { isValid, timestamp: now });
  
  // Nettoyer périodiquement le cache
  if (emailCache.size > 1000) { // Limiter la taille du cache
    const now = Date.now();
    for (const [key, value] of emailCache.entries()) {
      if (now - value.timestamp > EMAIL_CACHE_TTL * 2) {
        emailCache.delete(key);
      }
    }
  }

  return isValid;
}

// Métriques de performance
const performanceMetrics = {
  requests: 0,
  totalTime: 0,
  errors: 0,
  lastReset: Date.now(),
  
  recordRequest(duration, success = true) {
    this.requests++;
    this.totalTime += duration;
    if (!success) this.errors++;
    
    // Réinitialisation périodique (toutes les heures)
    if (Date.now() - this.lastReset > 3600000) {
      this.requests = 0;
      this.totalTime = 0;
      this.errors = 0;
      this.lastReset = Date.now();
    }
  },
  
  getStats() {
    return {
      totalRequests: this.requests,
      avgResponseTime: this.requests > 0 ? (this.totalTime / this.requests).toFixed(2) + 'ms' : 'N/A',
      errorRate: this.requests > 0 ? ((this.errors / this.requests) * 100).toFixed(2) + '%' : '0%',
      uptime: Math.floor((Date.now() - this.lastReset) / 1000) + 's'
    };
  },
  
  reset() {
    this.requests = 0;
    this.totalTime = 0;
    this.errors = 0;
    this.lastReset = Date.now();
  }
};

// Endpoint pour les métriques de performance
export const getMetrics = async (c) => {
  return c.json({
    status: 'success',
    data: performanceMetrics.getStats()
  });
};

// Requête SQL préparée (déclarée une seule fois)
const INSERT_CONTACT_QUERY = `
  INSERT INTO contacts 
  (id, prenom, nom, email, telephone, projet, whatsapp, created_at) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

export const submitContactForm = async (c) => {
  const startTime = process.hrtime();
  const requestId = Math.random().toString(36).substring(2, 10);
  let success = false;
  
  try {
    logger.debug(`[${requestId}] Nouvelle soumission de formulaire reçue`, {
      headers: c.req.raw.headers,
      ip: c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown'
    });
    
    // Récupérer les données validées et forcer whatsapp à true
    const { prenom, nom, email, telephone, projet } = c.req.valid || {};
    const whatsapp = true; // Toujours activer WhatsApp
    
    logger.info(`[${requestId}] Tentative de soumission pour l'email: ${email}`);
    logger.debug(`[${requestId}] Données du formulaire:`, { 
      prenom: prenom ? '***' : 'non fourni',
      nom: nom ? '***' : 'non fourni',
      email: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'non fourni',
      telephone: telephone ? '***' : 'non fourni',
      projet: projet ? projet.substring(0, 20) + (projet.length > 20 ? '...' : '') : 'non fourni',
      whatsapp: whatsapp ? 'oui' : 'non'
    });
    
    // Vérification d'email existant optimisée avec récupération de la date
    logger.debug(`[${requestId}] Vérification de l'existence de l'email`);
    const existing = await db.execute({
      sql: 'SELECT created_at FROM contacts WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      args: [email]
    });
    
    if (existing.rows.length > 0) {
      const existingDate = new Date(existing.rows[0].created_at);
      const formattedDate = existingDate.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const errorMessage = `Un message avec cette adresse email a déjà été envoyé le ${formattedDate}.`;
      logger.warn(`[${requestId}] ${errorMessage}`);
      
      performanceMetrics.recordRequest(
        process.hrtime(startTime)[1] / 1000000,
        false
      );
      
      return c.json({
        success: false,
        error: errorMessage,
        code: 'EMAIL_ALREADY_EXISTS',
        lastSent: formattedDate
      }, 400);
    }

    // Préparer et envoyer la réponse immédiatement
    c.res = c.json({
      success: true, 
      message: 'Votre message a été reçu. Nous vous contacterons bientôt !',
      requestId
    });
    
    // Fonction pour l'envoi des emails en arrière-plan
    const sendEmailsInBackground = async () => {
      if (!isValidEmail(email)) {
        logger.warn(`[${requestId}] Email invalide: ${email}`);
        return;
      }

      try {
        const emailSubject = projet 
          ? `[${projet.substring(0, 30)}${projet.length > 30 ? '...' : ''}]` 
          : 'Nouveau message';
        
        // Envoyer l'email de confirmation au visiteur
        await sendEmail({
          to: email,
          subject: `Confirmation - ${emailSubject}`,
          html: getConfirmationEmailTemplate({
            prenom,
            nom,
            sujet: projet?.substring(0, 100) || 'votre demande',
            message: projet
          })
        }).catch(error => 
          logger.error(`[${requestId}] Erreur email confirmation:`, error)
        );
        
        // Envoyer la notification de contact
        await sendContactNotification({
          prenom,
          nom,
          email,
          telephone,
          projet,
          requestId
        });
        
        logger.info(`[${requestId}] Tous les emails ont été traités`);
      } catch (error) {
        logger.error(`[${requestId}] Erreur globale d'envoi d'emails:`, error);
        throw error;
      }
    };

    // Début du traitement en arrière-plan
    (async () => {
      const contactId = crypto.randomUUID();
      
      try {
        // Insertion en base de données avec la requête préparée
        await db.execute({
          sql: INSERT_CONTACT_QUERY,
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
        success = true;
        
        // Lancer l'envoi des emails
        await sendEmailsInBackground();
        
      } catch (error) {
        logger.error(`[${requestId}] Erreur dans le traitement en arrière-plan:`, error);
      }
    })(); // IIFE pour exécuter immédiatement la fonction asynchrone

    
    // Lancer l'envoi des emails en arrière-plan sans attendre
    sendEmailsInBackground().catch(error => {
      logger.error(`[${requestId}] Erreur non gérée dans sendEmailsInBackground:`, error);
    });
    const contactEmail = process.env.CONTACT_EMAIL || 'deogratiashounnou1@gmail.com';
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
        
        const emailSubject = projet 
          ? `[${projet.substring(0, 30)}${projet.length > 30 ? '...' : ''}]` 
          : 'Nouveau message';
        
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
                    <a href="https://wa.me/${telephone ? telephone.replace(/[^0-9+]/g, '') : '+22900000000'}${telephone ? `?text=${encodeURIComponent(`Bonjour ${prenom || nom ? `Monsieur${nom ? ' ' + nom.toUpperCase() : ''}${prenom ? ' ' + prenom : ''}` : 'Madame, Monsieur'},\n\nJe vous écris car j'ai reçu votre message concernant "${projet || 'votre demande'}".\n\nCordialement,`)}` : ''}" 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background-color: #25D366; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: all 0.2s ease; opacity: ${telephone ? '1' : '0.7'};"
                       ${!telephone ? 'disabled title="Numéro de téléphone non fourni"' : ''}>
                      <i class="fab fa-whatsapp" style="font-size: 1.2em;"></i>
                      ${telephone ? 'Discuter sur WhatsApp' : 'WhatsApp non disponible'}
                    </a>
                    
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(projet || 'Votre demande')}&body=Bonjour ${prenom || nom ? `Monsieur${nom ? ' ' + nom.toUpperCase() : ''}${prenom ? ' ' + prenom : ''}` : 'Madame, Monsieur'},%0D%0A%0D%0AJe vous écris car j'ai reçu votre message concernant "${encodeURIComponent(projet || 'votre demande')}".%0D%0A%0D%0ACordialement," 
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
      }
    }
    
    // La réponse est déjà envoyée via c.res
    const processingTime = Date.now() - startTime;
    logger.info(`[${requestId}] Formulaire traité avec succès en ${processingTime}ms`);
    return c.res;
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

// Endpoint pour réinitialiser le rate limit
// Fonction pour réinitialiser tous les rate limits
export const resetAllRateLimits = async (c) => {
  try {
    const { resetRateLimit } = await import('../middlewares/rateLimit.js');
    const result = resetRateLimit(); // Appel sans paramètre pour tout supprimer
    
    return c.json({
      success: true,
      message: 'Tous les rate limits ont été réinitialisés avec succès',
      details: result
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du rate limit:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur lors de la réinitialisation du rate limit' 
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
