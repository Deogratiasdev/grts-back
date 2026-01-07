import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { logger } from '../utils/logger.js';
import cache from '../utils/sessionCache.js';

// Démarrer le nettoyage périodique du cache
cache.startCleanup();

const VERIFICATION_CODE_EXPIRY_MINUTES = 15;
const MAX_ATTEMPTS = 5;

class AuthModel {
  // Créer un code de vérification
  static async createVerificationCode(email) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + VERIFICATION_CODE_EXPIRY_MINUTES);

    try {
      // Supprimer les anciens codes
      await db.execute(
        'DELETE FROM verification_codes WHERE email = ?',
        [email]
      );

      // Insérer le nouveau code
      await db.execute(
        `INSERT INTO verification_codes (email, code, expires_at, attempts)
         VALUES (?, ?, ?, 0)`,
        [email, code, expiresAt.toISOString()]
      );

      // Mettre en cache le code
      cache.setVerificationCode(email, code);

      return code;
    } catch (error) {
      logger.error('Error creating verification code:', error);
      throw new Error('Failed to create verification code');
    }
  }

  // Vérifier un code de vérification
  static async verifyCode(email, code) {
    try {
      // Vérifier d'abord dans le cache
      const cached = cache.verifyCode(email, code);
      if (cached.valid) {
        return cached;
      }

      // Si pas dans le cache, vérifier dans la base de données
      const result = await db.execute(
        `SELECT * FROM verification_codes 
         WHERE email = ? AND code = ? AND used = 0 
         AND expires_at > CURRENT_TIMESTAMP`,
        [email, code]
      );

      // Vérifier si on a des résultats (structure de réponse différente avec Turso)
      if (!result || !result.rows || result.rows.length === 0) {
        // Incrémenter le compteur de tentatives
        try {
          await db.execute(
            `UPDATE verification_codes 
             SET attempts = attempts + 1 
             WHERE email = ? AND expires_at > CURRENT_TIMESTAMP`,
            [email]
          );
        } catch (updateError) {
          logger.error('Error updating attempt count:', updateError);
        }
        return { valid: false, message: 'Code invalide ou expiré' };
      }

      const verification = result.rows[0];
      
      // Vérifier le nombre de tentatives
      if (verification.attempts >= MAX_ATTEMPTS) {
        return { 
          valid: false, 
          message: 'Trop de tentatives. Veuillez demander un nouveau code.' 
        };
      }

      // Marquer le code comme utilisé
      try {
        await db.execute(
          'UPDATE verification_codes SET used = 1 WHERE id = ?',
          [verification.id]
        );
      } catch (updateError) {
        logger.error('Error marking code as used:', updateError);
      }

      return { valid: true };
    } catch (error) {
      logger.error('Error verifying code:', error);
      throw new Error('Failed to verify code');
    }
  }

  // Créer une session utilisateur
  static async createSession(userId, userAgent) {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours d'expiration

    try {
      // Supprimer les sessions existantes pour cet utilisateur
      await db.execute(
        'DELETE FROM user_sessions WHERE user_id = ?',
        [userId]
      );

      // Créer la nouvelle session
      await db.execute(
        `INSERT INTO user_sessions (id, user_id, user_agent, expires_at, created_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [sessionId, userId, userAgent, expiresAt.toISOString()]
      );

      // Mettre en cache la session
      const user = await this.getUserById(userId);
      if (user) {
        cache.setSession(sessionId, userId, {
          email: user.email,
          name: user.name,
          role: user.role
        });
      }
      
      return sessionId;
    } catch (error) {
      logger.error('Erreur lors de la création de la session:', error);
      throw new Error('Échec de la création de la session');
    }
  }

  // Nettoyer les sessions expirées
  static async cleanExpiredSessions() {
    try {
      await db.execute(
        'DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP'
      );
      logger.info('Nettoyage des sessions expirées effectué');
    } catch (error) {
      logger.error('Erreur lors du nettoyage des sessions expirées:', error);
    }
  }

  // Vérifier une session
  static async verifySession(sessionId) {
    // Vérifier d'abord dans le cache
    const cachedSession = cache.getSession(sessionId);
    if (cachedSession) {
      return { valid: true, user: cachedSession };
    }

    // Si pas dans le cache, vérifier dans la base de données
    try {
      const [result] = await db.execute(
        `SELECT u.id, u.email, u.name, u.role, u.created_at
         FROM user_sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ? AND s.expires_at > NOW()`,
        [sessionId]
      );

      if (result.rows && result.rows.length > 0) {
        const user = result.rows[0];
        // Mettre en cache la session
        cache.setSession(sessionId, user.id, {
          email: user.email,
          name: user.name,
          role: user.role
        });
        return { valid: true, user };
      }

      return { valid: false };
    } catch (error) {
      logger.error('Erreur lors de la vérification de la session:', error);
      return { valid: false };
    }
  }

  // Obtenir un utilisateur par ID
  static async getUserById(userId) {
    try {
      const result = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      // Vérifier si on a des résultats (structure de réponse différente avec Turso)
      if (result && result.rows && result.rows.length > 0) {
        return result.rows[0];
      }
      return null;
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'utilisateur par ID:', {
        userId,
        error: error.message,
        stack: error.stack
      });
      return null;
    }
  }

  // Vérifier si un email est autorisé
  static async isEmailAllowed(email) {
    try {
      // Vérifier dans le cache d'abord
      const cachedRole = cache.isEmailAllowed(email);
      if (cachedRole) {
        return { allowed: true, role: cachedRole.role };
      }

      // Vérifier si c'est l'email admin
      if (email === process.env.ADMIN_EMAIL_1) {
        const result = { allowed: true, role: 'super_admin' };
        cache.setAllowedEmail(email, result.role);
        return result;
      }

      // Vérifier dans la table des autorisations
      try {
        const [rows] = await db.execute(
          'SELECT * FROM autorisations WHERE email = ?',
          [email]
        );

        // Vérifier si nous avons des résultats
        if (Array.isArray(rows) && rows.length > 0) {
          const role = rows[0].role || 'admin';
          cache.setAllowedEmail(email, role);
          return { allowed: true, role };
        }
      } catch (dbError) {
        logger.error('Erreur lors de la vérification des autorisations en base de données:', dbError);
        // En cas d'erreur de base de données, on continue pour vérifier l'email admin
      }

      return { allowed: false };
    } catch (error) {
      logger.error('Error checking email authorization:', error);
      return { allowed: false };
    }
  }

  // Obtenir un utilisateur par email
  static async getUserByEmail(email) {
    try {
      // Vérifier d'abord si l'utilisateur existe
      const result = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      // Vérifier si on a des résultats (structure de réponse différente avec Turso)
      if (result && result.rows && result.rows.length > 0) {
        return result.rows[0];
      }

      // Vérifier si l'email est autorisé
      const { allowed, role } = await this.isEmailAllowed(email);
      if (!allowed) {
        throw new Error('Email non autorisé');
      }

      // Créer le nouvel utilisateur
      const newUser = {
        id: uuidv4(),
        email,
        name: email.split('@')[0],
        role: role || 'user',
        created_at: new Date().toISOString()
      };

      try {
        await db.execute(
          `INSERT INTO users (id, email, name, role, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [newUser.id, newUser.email, newUser.name, newUser.role, newUser.created_at]
        );
        logger.info(`Nouvel utilisateur créé: ${email}`);
      } catch (insertError) {
        // En cas d'erreur d'insertion, vérifier si l'utilisateur a été créé entre-temps
        if (insertError.message.includes('UNIQUE constraint failed')) {
          const retryResult = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
          );
          
          if (retryResult && retryResult.rows && retryResult.rows.length > 0) {
            return retryResult.rows[0];
          }
        }
        throw insertError;
      }

      return newUser;
    } catch (error) {
      logger.error('Erreur lors de la récupération/création de l\'utilisateur:', {
        email,
        error: error.message,
        stack: error.stack
      });
      throw new Error('Échec de la récupération de l\'utilisateur: ' + error.message);
    }
  }
}

export default AuthModel;
