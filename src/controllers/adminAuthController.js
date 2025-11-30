import { sendEmail } from '../services/emailService.js';
import db from '../config/db.js';
import crypto from 'crypto';

const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL_1,
  process.env.ADMIN_EMAIL_2
].filter(Boolean);

/**
 * Génère un token sécurisé
 * @returns {string} Token de 32 caractères hexadécimaux
 */
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Vérifie si l'email est un email admin valide
 * @param {string} email Email à vérifier
 * @returns {boolean} true si l'email est un admin
 */
function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(email);
}

/**
 * Crée un token d'authentification pour l'email spécifié
 * @param {string} email Email de l'admin
 * @returns {Promise<string>} Le token généré
 */
async function createAuthToken(email) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expire dans 15 minutes
  const now = new Date().toISOString();

  // Vérifier s'il existe déjà un token pour cet email
  const result = await db.execute({
    sql: 'SELECT * FROM auth_tokens WHERE email = ?',
    args: [email]
  });
  
  // S'assurer que existingTokens est bien un tableau, même si vide
  const existingTokens = Array.isArray(result) ? result[0] : [];

  if (existingTokens && existingTokens.length > 0) {
    // Mettre à jour le token existant
    await db.execute({
      sql: 'UPDATE auth_tokens SET token = ?, expires_at = ?, created_at = ? WHERE email = ?',
      args: [token, expiresAt.toISOString(), now, email]
    });
  } else {
    // Créer un nouveau token
    await db.execute({
      sql: 'INSERT INTO auth_tokens (email, token, expires_at, created_at) VALUES (?, ?, ?, ?)',
      args: [email, token, expiresAt.toISOString(), now]
    });
  }

  return token;
}

/**
 * Envoie l'email de connexion avec le lien d'authentification
 * @param {string} email Email du destinataire
 * @param {string} token Token d'authentification
 * @returns {Promise<Object>} Résultat de l'envoi d'email
 */
async function sendAuthEmail(email, token) {
  const loginUrl = `${process.env.FRONTEND_URL}/admin/check?token=${token}`;
  
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Connexion à l'administration - HOUNNOU Déo-Gratias</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.7;
          color: #333;
          background: #f9f9f9;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .container {
          max-width: 600px;
          margin: 2rem auto;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #eee;
        }
        .header {
          padding: 2rem;
          background: #0a0a0a;
          color: white;
          text-align: center;
        }
        .content {
          padding: 2rem;
          line-height: 1.8;
          color: #333;
        }
        .content h2 {
          color: #0a0a0a;
          margin-top: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .content p {
          margin: 1.2rem 0;
          color: #333;
        }
        .highlight {
          color: #ff6b35;
          font-weight: 500;
        }
        .footer {
          padding: 1.5rem 2rem;
          background: #f5f5f5;
          text-align: center;
          font-size: 0.9em;
          color: #666;
          border-top: 1px solid #eee;
        }
        .button-container {
          margin: 2rem 0;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #0a0a0a;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .button:hover {
          background-color: #333;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .expiry-note {
          font-size: 0.9em;
          color: #666;
          margin-top: 2rem;
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 4px;
          border-left: 4px solid #ff6b35;
        }
        .manual-link {
          word-break: break-all;
          font-size: 0.85em;
          color: #666;
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          margin-top: 1rem;
          display: block;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content {
            padding: 1.5rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Connexion à l'administration</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Vous avez demandé à vous connecter à l'administration de votre espace. Cliquez sur le bouton ci-dessous pour accéder à votre tableau de bord :</p>
          
          <div class="button-container">
            <a href="${loginUrl}" class="button">Se connecter à l'administration</a>
          </div>
          
          <div class="expiry-note">
            <p>⏱️ <strong>Ce lien est valable 15 minutes</strong></p>
            <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
          </div>
          
          <p class="manual-link">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            ${loginUrl}
          </p>
          
          <p>Bien cordialement,<br>
          <strong>L'équipe HOUNNOU Déo-Gratias</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} HOUNNOU Déo-Gratias. Tous droits réservés.</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🔐 Lien de connexion sécurisé - Administration',
    html: emailTemplate
  });
}

/**
 * Contrôleur pour la demande de connexion admin
 */
import jwt from 'jsonwebtoken';

/**
 * Vérifie un token d'authentification et renvoie un JWT
 */
export const verifyToken = async (c) => {
  try {
    const { token } = c.req.query();
    
    if (!token) {
      return c.json({ success: false, message: 'Token manquant' }, 400);
    }

    // Vérifier le token dans la base de données
    const [tokens] = await db.execute({
      sql: 'SELECT email FROM auth_tokens WHERE token = ? AND expires_at > ?',
      args: [token, new Date().toISOString()]
    });

    if (!tokens || tokens.length === 0) {
      return c.json({ success: false, message: 'Token invalide ou expiré' }, 401);
    }

    const { email } = tokens[0];
    
    // Créer un JWT
    const jwtToken = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Supprimer le token utilisé
    await db.execute({
      sql: 'DELETE FROM auth_tokens WHERE token = ?',
      args: [token]
    });

    // Renvoyer la réponse avec le cookie
    return c.json(
      { success: true, email },
      200,
      {
        headers: {
          'Set-Cookie': `admin_token=${jwtToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
        }
      }
    );

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return c.json({ success: false, message: 'Erreur de vérification' }, 500);
  }
};

/**
 * Contrôleur pour la demande de connexion admin
 */
export const requestAdminLogin = async (c) => {
  console.log('Requête reçue sur /admin/auths-connection');
  
  try {
    const body = await c.req.json();
    const email = body.email;
    console.log('Email reçu:', email);
    
    if (!email) {
      console.log('Erreur: Email manquant');
      return c.json({ code: '00', message: 'Email requis' }, 400);
    }

    // Vérifier si l'email est un admin mais ne pas le révéler dans la réponse
    const isAdmin = isAdminEmail(email);
    
    // Toujours renvoyer le même message pour éviter les fuites d'information
    const successMessage = 'Si votre adresse est enregistrée, vous recevrez un lien de connexion par email.';
    
    // Si c'est un admin, envoyer l'email mais ne pas le révéler
    if (isAdmin) {
      try {
        // Créer et sauvegarder le token
        const token = await createAuthToken(email);
        
        // Envoyer l'email de connexion
        await sendAuthEmail(email, token);
        console.log(`Email de connexion envoyé à: ${email}`);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        // Ne pas révéler l'erreur à l'utilisateur
      }
    } else {
      // Simuler un délai similaire pour éviter les attaques par timing
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Tentative de connexion avec un email non admin: ${email}`);
    }
    
    // Renvoyer une réponse de succès sans message
    return c.json({ 
      success: true
    });
    
  } catch (error) {
    console.error('Erreur lors de la demande de connexion admin:', error);
    return c.json({ 
      code: '00', 
      message: `Erreur lors du traitement de la demande: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, 500);
  }
};
