import db from '../config/db.js';
import { encryptEmail, hashEmail, decryptEmail } from '../config/db-init.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from './emailController.js';

// Vérifier si un email est administrateur
export const isAdmin = async (email) => {
  try {
    const emailHash = hashEmail(email);
    const result = await db.execute({
      sql: 'SELECT * FROM admins WHERE email_hash = ? AND is_active = 1',
      args: [emailHash]
    });
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Erreur lors de la vérification administrateur:', error);
    return null;
  }
};

// Générer un token JWT pour l'admin
export const generateAdminToken = (adminData) => {
  return jwt.sign(
    { 
      id: adminData.id,
      email: adminData.email,
      isAdmin: true 
    },
    process.env.JWT_SECRET || 'U7TqUvPYNECKzReXBH4DElF7/pl8xRkB7G4MPp8B3yR8M7c849G/QXIUudYC/bxu',
    { expiresIn: '8h' }
  );
};

// Vérifier le token JWT
export const verifyAdminToken = (token) => {
  try {
    return jwt.verify(
      token, 
      process.env.JWT_SECRET || 'U7TqUvPYNECKzReXBH4DElF7/pl8xRkB7G4MPp8B3yR8M7c849G/QXIUudYC/bxu'
    );
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
};

// Envoyer un email de connexion à l'admin
export const sendAdminLoginEmail = async (email) => {
  try {
    // Vérifier si l'email est un admin
    const admin = await isAdmin(email);
    if (!admin) {
      return { success: false, error: 'Accès non autorisé' };
    }

    // Décrypter l'email pour l'affichage
    const decryptedEmail = decryptEmail(admin.email_encrypted);
    
    // Générer un token JWT
    const token = generateAdminToken({ 
      id: admin.id, 
      email: decryptedEmail 
    });

    // Déterminer l'URL de base en fonction de l'environnement
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev 
      ? 'http://10.10.11.50:8080' 
      : 'https://grts.pages.dev';
    
    const loginUrl = `${baseUrl}/admin/home?token=${token}`;

    // Envoyer l'email
    await sendEmail({
      to: decryptedEmail,
      subject: 'Lien de connexion administrateur',
      html: `
        <p>Bonjour,</p>
        <p>Voici votre lien de connexion pour accéder au panneau d'administration :</p>
        <p><a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">
          Se connecter à l'administration
        </a></p>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette connexion, veuillez ignorer cet email.</p>
      `
    });

    return { success: true, message: 'Email de connexion envoyé avec succès' };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de connexion:', error);
    return { 
      success: false, 
      error: 'Une erreur est survenue lors de l\'envoi de l\'email de connexion' 
    };
  }
};

// Récupérer le profil de l'admin connecté
export const getAdminProfile = async (adminId) => {
  try {
    const result = await db.execute({
      sql: 'SELECT id, email_encrypted, created_at FROM admins WHERE id = ? AND is_active = 1',
      args: [adminId]
    });

    if (result.rows.length === 0) {
      return { success: false, error: 'Administrateur non trouvé' };
    }

    const admin = result.rows[0];
    return { 
      success: true, 
      data: {
        id: admin.id,
        email: decryptEmail(admin.email_encrypted),
        createdAt: admin.created_at
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du profil admin:', error);
    return { 
      success: false, 
      error: 'Erreur lors de la récupération du profil' 
    };
  }
};

// Récupérer les statistiques du tableau de bord
export const getDashboardStats = async () => {
  try {
    // Exemple de requêtes pour les statistiques
    const [usersCount, messagesCount, activities] = await Promise.all([
      db.execute({ sql: 'SELECT COUNT(*) as count FROM users WHERE is_active = 1' }),
      db.execute({ sql: 'SELECT COUNT(*) as count FROM contact_messages' }),
      db.execute({
        sql: 'SELECT * FROM admin_activities ORDER BY created_at DESC LIMIT 5'
      })
    ]);

    return {
      success: true,
      stats: {
        userCount: usersCount.rows[0]?.count || 0,
        messageCount: messagesCount.rows[0]?.count || 0,
        activityCount: activities.rows.length,
        recentActivity: activities.rows.map(act => ({
          id: act.id,
          description: act.description,
          timestamp: act.created_at
        }))
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return { 
      success: false, 
      error: 'Erreur lors de la récupération des statistiques' 
    };
  }
};

// Ajouter un administrateur
export const addAdmin = async (email) => {
  try {
    const emailEncrypted = encryptEmail(email);
    const emailHashed = hashEmail(email);
    
    await db.execute({
      sql: 'INSERT INTO admins (email_encrypted, email_hash) VALUES (?, ?)',
      args: [emailEncrypted, emailHashed]
    });
    
    return { success: true, message: 'Administrateur ajouté avec succès' };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Cet email est déjà administrateur' };
    }
    console.error('Erreur lors de l\'ajout d\'un administrateur:', error);
    return { success: false, error: 'Erreur lors de l\'ajout de l\'administrateur' };
  }
};

// Supprimer un administrateur
export const removeAdmin = async (email) => {
  try {
    const emailHash = hashEmail(email);
    
    const result = await db.execute({
      sql: 'UPDATE admins SET is_active = 0 WHERE email_hash = ?',
      args: [emailHash]
    });
    
    if (result.rowsAffected === 0) {
      return { success: false, error: 'Administrateur non trouvé' };
    }
    
    return { success: true, message: 'Administrateur supprimé avec succès' };
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un administrateur:', error);
    return { success: false, error: 'Erreur lors de la suppression de l\'administrateur' };
  }
};

// Lister tous les administrateurs
export const listAdmins = async () => {
  try {
    const result = await db.execute({
      sql: 'SELECT email_encrypted, created_at FROM admins WHERE is_active = 1'
    });
    
    // Décrypter les emails pour l'affichage
    const admins = result.rows.map(row => ({
      email: decryptEmail(row.email_encrypted),
      created_at: row.created_at
    }));
    
    return { success: true, admins };
  } catch (error) {
    console.error('Erreur lors de la récupération des administrateurs:', error);
    return { success: false, error: 'Erreur lors de la récupération des administrateurs' };
  }
};
