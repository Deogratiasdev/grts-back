import { Hono } from 'hono';
import { logger } from '../utils/logger.js';
import AuthModel from '../models/auth.model.js';
import { sendEmail } from '../services/emailService.js';
import db from '../config/db.js';

class AuthController {
  // Envoyer un code de vérification
  static async sendVerificationCode(c) {
    try {
      const body = await c.req.json();
      logger.info('Requête reçue - sendVerificationCode:', { 
        url: c.req.url,
        method: c.req.method,
        headers: Object.fromEntries(c.req.raw.headers),
        body
      });
      
      const { email } = body;

      // Valider l'email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return c.json(
          { success: false, message: 'Email invalide' },
          400
        );
      }

      // Vérifier si l'email est autorisé
      const { allowed, role } = await AuthModel.isEmailAllowed(email);
      
      if (!allowed) {
        return c.json(
          { 
            success: false, 
            message: 'Accès non autorisé. Veuillez contacter un administrateur.' 
          },
          403
        );
      }

      // Créer et envoyer le code de vérification
      const code = await AuthModel.createVerificationCode(email);
      
      // Envoyer l'email de vérification
      const emailSubject = 'Votre code de vérification';
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${emailSubject}</title>
          <style>
            :root {
              /* Couleurs du thème clair (par défaut) */
              --bg-color: #ffffff;
              --text-color: #1a1a1a;
              --primary-color: #2c3e50;
              --secondary-color: #6c757d;
              --border-color: #dee2e6;
              --code-bg: #f8f9fa;
              --note-bg: #f8f9fa;
              --note-border: #6c757d;
              --header-border: #eee;
              --footer-border: #eee;
            }
            
            @media (prefers-color-scheme: dark) {
              :root {
                /* Couleurs du thème sombre */
                --bg-color: #1a1a1a;
                --text-color: #f8f9fa;
                --primary-color: #6c9ef8;
                --secondary-color: #adb5bd;
                --border-color: #495057;
                --code-bg: #2b3035;
                --note-bg: #2b3035;
                --note-border: #6c757d;
                --header-border: #343a40;
                --footer-border: #343a40;
              }
            }
            
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: var(--text-color);
              background-color: var(--bg-color);
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            
            .header { 
              text-align: center; 
              padding: 20px 0; 
              border-bottom: 1px solid var(--header-border); 
            }
            
            .content { 
              padding: 20px 0; 
            }
            
            .code { 
              background-color: var(--code-bg); 
              padding: 15px; 
              margin: 20px 0; 
              text-align: center; 
              font-size: 24px; 
              font-weight: bold; 
              letter-spacing: 3px;
              color: var(--primary-color);
              border-radius: 4px;
              border: 1px solid var(--border-color);
            }
            
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid var(--footer-border); 
              font-size: 12px; 
              color: var(--secondary-color);
              text-align: center;
            }
            
            .note {
              background-color: var(--note-bg);
              padding: 12px 15px;
              border-left: 4px solid var(--note-border);
              margin: 15px 0;
              font-size: 14px;
              border-radius: 0 4px 4px 0;
            }
            
            h2 {
              color: var(--primary-color);
              margin: 0;
            }
            
            a {
              color: var(--primary-color);
              text-decoration: none;
            }
            
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Votre code de vérification</h2>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Pour accéder à votre compte, veuillez utiliser le code de vérification suivant :</p>
            
            <div class="code">${code}</div>
            
            <div class="note">
              <p><strong>Important :</strong> Ce code est valable pendant 15 minutes.</p>
              <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email ou nous contacter immédiatement.</p>
            </div>
            
            <p>Cordialement,<br>L'équipe de support</p>
          </div>
          
          <div class="footer">
            <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
            <p>© ${new Date().getFullYear()} Tous droits réservés</p>
          </div>
        </body>
        </html>
      `;
      
      await sendEmail({
        to: email,
        subject: emailSubject,
        html: emailHtml
      });

      const responseData = {
        success: true,
        message: 'Code de vérification envoyé avec succès'
      };
      
      logger.info('Réponse envoyée - sendVerificationCode:', {
        status: 200,
        response: responseData
      });
      
      return c.json(responseData);
    } catch (error) {
      const errorResponse = { 
        success: false, 
        message: 'Erreur lors de l\'envoi du code de vérification',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
      
      logger.error('Erreur dans sendVerificationCode:', {
        error: error.message,
        stack: error.stack,
        response: errorResponse
      });
      
      return c.json(errorResponse, 500);
    }
  }

  // Vérifier le code et connecter l'utilisateur
  static async verifyCodeAndLogin(c) {
    try {
      const body = await c.req.json();
      logger.info('Requête reçue - verifyCodeAndLogin:', { 
        url: c.req.url,
        method: c.req.method,
        headers: Object.fromEntries(c.req.raw.headers),
        body
      });
      
      const { email, code } = body;

      // Valider l'entrée
      if (!email || !code) {
        return c.json(
          { success: false, message: 'Email et code requis' },
          400
        );
      }

      // Vérifier le code
      const { valid, message } = await AuthModel.verifyCode(email, code);
      if (!valid) {
        return c.json({ success: false, message }, 400);
      }

      // Nettoyer les sessions expirées
      await AuthModel.cleanExpiredSessions();

      // Obtenir ou créer l'utilisateur
      const user = await AuthModel.getUserByEmail(email);

      // Créer une nouvelle session (les anciennes seront supprimées automatiquement)
      const userAgent = c.req.header('user-agent') || '';
      const sessionId = await AuthModel.createSession(user.id, userAgent);

      // Retourner le token dans la réponse JSON
      const responseData = {
        success: true,
        authToken: sessionId,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
      
      logger.info('Réponse envoyée - verifyCodeAndLogin:', {
        status: 200,
        response: responseData
      });
      
      return c.json(responseData);
    } catch (error) {
      const errorResponse = { 
        success: false, 
        message: 'Erreur lors de la connexion',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
      
      logger.error('Erreur dans verifyCodeAndLogin:', {
        error: error.message,
        stack: error.stack,
        response: errorResponse
      });
      
      return c.json(errorResponse, 500);
    }
  }

  // Déconnexion
  static async logout(c) {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ success: true, message: 'Déjà déconnecté' });
      }
      
      const sessionId = authHeader.split(' ')[1];
      
      // Supprimer la session de la base de données
      if (db) {
        await db.execute(
          'DELETE FROM user_sessions WHERE id = ?',
          [sessionId]
        );
      }

      return c.json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      logger.error('Error during logout:', error);
      return c.json(
        { success: false, message: 'Erreur lors de la déconnexion' },
        500
      );
    }
  }

  // Vérifier l'état d'authentification
  static async checkAuth(c) {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ authenticated: false }, 200);
      }
      
      const sessionId = authHeader.split(' ')[1];

      // Vérifier la session (le cache est géré en interne par verifySession)
      const { valid, user } = await AuthModel.verifySession(sessionId);
      
      if (valid && user) {
        return c.json({
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at
          }
        });
      }

      return c.json({ authenticated: false }, 200);
    } catch (error) {
      logger.error('Erreur lors de la vérification de l\'authentification:', error);
      return c.json({ 
        authenticated: false,
        error: 'Erreur lors de la vérification de l\'authentification'
      }, 500);
    }
  }
}

export default AuthController;
