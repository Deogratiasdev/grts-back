import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { createClient } from '@libsql/client';
import { encryptEmail, hashEmail } from './src/config/db-init.js';
// Stockage en mémoire pour le rate limiting
const rateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // 10 requêtes max par fenêtre
import { validator } from 'hono/validator';
import SibApiV3Sdk from 'sib-api-v3-sdk';

const app = new Hono();
const PORT = process.env.PORT || 3000;

// Configuration de la base de données Turso
const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN
});

// Configuration de Brevo (Sendinblue)
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Middleware
app.use('*', cors());

// Middleware de rate limiting personnalisé
const rateLimitMiddleware = async (c, next) => {
  const now = Date.now();
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    const rateLimit = rateLimits.get(ip);
    
    if (now > rateLimit.resetAt) {
      // Réinitialiser le compteur si la fenêtre est expirée
      rateLimit.count = 1;
      rateLimit.resetAt = now + RATE_LIMIT_WINDOW_MS;
    } else if (rateLimit.count >= RATE_LIMIT_MAX) {
      // Bloquer la requête si la limite est atteinte
      c.status(429);
      return c.json({ error: 'Trop de requêtes, veuillez réessayer plus tard.' });
    } else {
      // Incrémenter le compteur
      rateLimit.count++;
    }
  }
  
  await next();
};

// Fonction de validation
const validateContact = (value, c) => {
  const { prenom, nom, email, telephone, projet, whatsapp } = value;
  const errors = [];
  
  if (prenom && prenom.length > 50) errors.push('Le prénom ne doit pas dépasser 50 caractères');
  if (nom && nom.length > 50) errors.push('Le nom ne doit pas dépasser 50 caractères');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email invalide');
  if (telephone && !/^[0-9+\s-]+$/.test(telephone)) errors.push('Numéro de téléphone invalide');
  if (projet && projet.length > 1000) errors.push('Le message ne doit pas dépasser 1000 caractères');
  if (whatsapp && typeof whatsapp !== 'boolean') errors.push('WhatsApp doit être un booléen');
  
  if (errors.length > 0) {
    return c.json({ errors }, 400);
  }
  
  return { prenom, nom, email, telephone, projet, whatsapp };
};

// Route pour soumettre le formulaire
app.post(
  '/api/contact',
  rateLimitMiddleware,
  validator('json', (value, c) => {
    try {
      return validateContact(value, c);
    } catch (e) {
      return c.json({ error: 'Données invalides' }, 400);
    }
  }),
  async (c) => {
    try {
      const { prenom, nom, email, telephone, projet, whatsapp } = c.req.valid('json');
      
      // Vérifier si l'email existe déjà
      const existing = await db.execute({
        sql: 'SELECT id FROM contacts WHERE email = ?',
        args: [email]
      });
      
      if (existing.rows.length > 0) {
        return c.json({ error: 'Cet email a déjà été utilisé.' }, 400);
      }

      // Insérer dans la base de données
      await db.execute({
        sql: 'INSERT INTO contacts (prenom, nom, email, telephone, projet, whatsapp, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [prenom, nom, email, telephone, projet, whatsapp ? 1 : 0, new Date().toISOString()]
      });

      // Envoyer l'email de confirmation
      await sendConfirmationEmail(email, prenom || 'Client');
      
      // Envoyer une notification à l'administrateur
      await sendAdminNotification({ prenom, nom, email, telephone, projet, whatsapp });

      return c.json({ message: 'Message envoyé avec succès !' });
    } catch (error) {
      console.error('Erreur lors du traitement du formulaire:', error);
      return c.json({ error: 'Une erreur est survenue lors de l\'envoi du message.' }, 500);
    }
  }
);

// Fonction pour envoyer l'email de confirmation
async function sendConfirmationEmail(toEmail, firstName) {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: toEmail, name: firstName }];
  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME
  };
  sendSmtpEmail.subject = 'Merci pour votre message !';
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Inter', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #fff5f0;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 2rem; 
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
          text-align: center; 
          padding: 2rem 0;
          background: linear-gradient(135deg, #ff6b35, #ff8c5a);
          color: white;
          border-radius: 8px 8px 0 0;
          margin: -2rem -2rem 2rem -2rem;
        }
        .content { 
          padding: 0 1.5rem 2rem; 
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #ff6b35;
          color: white !important;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          margin: 1.5rem 0;
        }
        .footer { 
          text-align: center; 
          margin-top: 2rem; 
          padding-top: 1.5rem; 
          border-top: 1px solid #eee;
          color: #777;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Merci pour votre message !</h1>
        </div>
        <div class="content">
          <p>Bonjour ${firstName},</p>
          <p>Nous avons bien reçu votre message et nous vous remercions de l'intérêt que vous portez à nos services.</p>
          <p>Notre équipe va examiner votre demande et vous contactera dans les plus brefs délais, généralement sous 24 heures.</p>
          <p>En attendant, n'hésitez pas à explorer notre site pour en savoir plus sur nos services et réalisations.</p>
          <div style="text-align: center;">
            <a href="https://votresite.com" class="button">Visiter notre site</a>
          </div>
          <p>Cordialement,<br>L'équipe Déo-Gratias</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Déo-Gratias. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
  }
}

// Fonction pour envoyer une notification à l'administrateur
async function sendAdminNotification(formData) {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: process.env.BREVO_SENDER_EMAIL, name: 'Admin' }];
  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME
  };
  sendSmtpEmail.subject = 'Nouvelle soumission de formulaire';
  
  const contactMethod = formData.whatsapp ? 'WhatsApp' : 'Téléphone';
  
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Inter', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 2rem; 
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
          text-align: center; 
          padding: 1.5rem 0;
          background: #2c3e50;
          color: white;
          border-radius: 8px 8px 0 0;
          margin: -2rem -2rem 2rem -2rem;
        }
        .content { 
          padding: 0 1.5rem 2rem; 
        }
        .details {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          border-left: 4px solid #ff6b35;
        }
        .footer { 
          text-align: center; 
          margin-top: 2rem; 
          padding-top: 1.5rem; 
          border-top: 1px solid #eee;
          color: #777;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Nouvelle soumission de formulaire</h2>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Une nouvelle soumission de formulaire a été reçue avec les détails suivants :</p>
          
          <div class="details">
            <p><strong>Nom :</strong> ${formData.prenom || 'Non spécifié'} ${formData.nom || 'Non spécifié'}</p>
            <p><strong>Email :</strong> ${formData.email}</p>
            <p><strong>Téléphone :</strong> ${formData.telephone} (${contactMethod})</p>
            <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <p><strong>Message :</strong></p>
            <p>${formData.projet || 'Aucun message'}</p>
          </div>
          
          <p>Veuillez répondre à ce message dans les plus brefs délais.</p>
          
          <p>Cordialement,<br>Votre application de formulaire</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Déo-Gratias. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification à l\'administrateur:', error);
  }
}

// Route de base pour vérifier que le serveur fonctionne
app.get('/', (c) => {
  return c.text('Serveur de formulaire de contact en cours d\'exécution');
});

// Gestion des erreurs globales
app.onError((err, c) => {
  console.error('Erreur non gérée:', err);
  return c.json({ error: 'Une erreur interne est survenue' }, 500);
});

// Fonction pour initialiser la base de données
async function initializeDatabase() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prenom TEXT,
        nom TEXT,
        email TEXT NOT NULL UNIQUE,
        telephone TEXT,
        projet TEXT NOT NULL,
        whatsapp BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Fonction pour initialiser les administrateurs
const initializeAdmins = async () => {
  try {
    const adminEmails = [
      process.env.ADMIN_EMAIL_1 || 'gratiashounnou@gmail.com',
      process.env.ADMIN_EMAIL_2 || 'deogratiashounnou1@gmail.com'
    ];

    console.log('🔍 Vérification des administrateurs...');
    console.log(`📧 Emails admin configurés: ${adminEmails.join(', ')}`);

    for (const email of adminEmails) {
      if (!email) {
        console.warn('⚠️  Email admin vide ignoré');
        continue;
      }
      
      console.log(`\n🔑 Traitement de l'admin: ${email}`);
      const emailHash = hashEmail(email);
      const emailEncrypted = encryptEmail(email);
      
      try {
        // Vérifier si l'admin existe déjà
        const existingAdmin = await db.execute({
          sql: 'SELECT id, is_active FROM admins WHERE email_hash = ?',
          args: [emailHash]
        });

        if (existingAdmin.rows.length === 0) {
          // Créer l'admin s'il n'existe pas
          const result = await db.execute({
            sql: 'INSERT INTO admins (email_encrypted, email_hash, is_active) VALUES (?, ?, 1) RETURNING id',
            args: [emailEncrypted, emailHash]
          });
          const newAdminId = result.rows[0].id;
          console.log(`✅ Nouvel admin créé - ID: ${newAdminId}, Email: ${email}`);
        } else {
          const adminId = existingAdmin.rows[0].id;
          const isActive = existingAdmin.rows[0].is_active;
          
          if (!isActive) {
            // Réactiver l'admin s'il est désactivé
            await db.execute({
              sql: 'UPDATE admins SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              args: [adminId]
            });
            console.log(`🔄 Admin réactivé - ID: ${adminId}, Email: ${email}`);
          } else {
            console.log(`ℹ️  Admin existant - ID: ${adminId}, Email: ${email}, Statut: Actif`);
          }
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de l'admin ${email}:`, error);
        throw error;
      }
    }
    
    // Afficher la liste des administrateurs actifs
    const activeAdmins = await db.execute(
      'SELECT id, email_encrypted, created_at FROM admins WHERE is_active = 1'
    );
    
    console.log('\n👥 Liste des administrateurs actifs:');
    for (const admin of activeAdmins.rows) {
      const email = decryptEmail(admin.email_encrypted);
      console.log(`   - ID: ${admin.id}, Email: ${email}, Créé le: ${new Date(admin.created_at).toLocaleString()}`);
    }
    
    console.log('\n✅ Initialisation des administrateurs terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur critique lors de l\'initialisation des administrateurs:', error);
    throw error;
  }
};

// Démarrer le serveur
const startServer = async () => {
  try {
    console.log('🔄 Initialisation du serveur...');
    
    // Vérifier les variables d'environnement critiques
    if (!process.env.JWT_SECRET || !process.env.ENCRYPTION_KEY) {
      throw new Error('Variables d\'environnement manquantes (JWT_SECRET ou ENCRYPTION_KEY)');
    }
    
    await initializeDatabase();
    await initializeAdmins();
    
    const server = serve({
      fetch: app.fetch,
      port: PORT,
      // Gestion des erreurs de port déjà utilisé
      reusePort: true
    }, (info) => {
      console.log('\n' + '='.repeat(60));
      console.log(`🚀 Serveur démarré avec succès sur http://localhost:${info.port}`);
      console.log(`📅 ${new Date().toLocaleString()}`);
      console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60) + '\n');
    });
    
    // Gestion de l'arrêt propre du serveur
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt propre du serveur...');
      server.close(() => {
        console.log('✅ Serveur arrêté avec succès');
        process.exit(0);
      });
    });
    
    return server;
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE LORS DU DÉMARRAGE DU SERVEUR');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('\n❌ Impossible de démarrer le serveur. Vérifiez les logs ci-dessus pour plus de détails.\n');
    process.exit(1);
  }
};

startServer();
