import { sendEmail } from '../services/emailService.js';
import db from '../config/db.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const ADMIN_EMAIL = 'deogratiashounnou1@gmail.com';

/**
 * Génère un code de vérification à 6 chiffres
 * @returns {string} Code à 6 chiffres
 */
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Vérifie si l'email est l'email admin
 * @param {string} email Email à vérifier
 * @returns {boolean} true si c'est l'email admin
 */
function isAdminEmail(email) {
    return email === ADMIN_EMAIL;
}

/**
 * Crée ou met à jour un code de vérification
 * @param {string} email Email de l'admin
 * @returns {Promise<string>} Le code généré
 */
async function createVerificationCode(email) {
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expire dans 15 minutes
    const now = new Date().toISOString();

    // Vérifier s'il existe déjà un code pour cet email
    const existingCode = await db.execute({
        sql: 'SELECT * FROM verification_codes WHERE email = ?',
        args: [email]
    });

    if (existingCode.rows && existingCode.rows.length > 0) {
        // Mettre à jour le code existant
        await db.execute({
            sql: 'UPDATE verification_codes SET code = ?, expires_at = ?, created_at = ? WHERE email = ?',
            args: [code, expiresAt.toISOString(), now, email]
        });
    } else {
        // Créer un nouveau code
        await db.execute({
            sql: 'INSERT INTO verification_codes (email, code, expires_at, created_at) VALUES (?, ?, ?, ?)',
            args: [email, code, expiresAt.toISOString(), now]
        });
    }

    return code;
}

/**
 * Envoie l'email avec le code de vérification
 * @param {string} email Email du destinataire
 * @param {string} code Code de vérification
 * @returns {Promise<Object>} Résultat de l'envoi d'email
 */
async function sendVerificationEmail(email, code) {
    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1e40af;">Votre code de vérification</h2>
                <p>Utilisez le code suivant pour accéder à votre espace administrateur :</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; display: inline-block; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e40af;">
                        ${code}
                    </span>
                </div>
                <p>Ce code est valable pendant 15 minutes.</p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.
                </p>
            </div>
        </div>
    `;

    return await sendEmail({
        to: email,
        subject: 'Votre code de vérification administrateur',
        html: emailContent
    });
}

/**
 * Nettoie les codes expirés de la base de données
 */
async function cleanupExpiredCodes() {
    const now = new Date().toISOString();
    await db.execute({
        sql: 'DELETE FROM verification_codes WHERE expires_at < ?',
        args: [now]
    });
}

/**
 * Vérifie si le code est valide
 * @param {string} email Email de l'admin
 * @param {string} code Code à vérifier
 * @returns {Promise<boolean>} true si le code est valide
 */
async function verifyCode(email, code) {
    const now = new Date().toISOString();
    
    const result = await db.execute({
        sql: 'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > ?',
        args: [email, code, now]
    });

    // Supprimer le code après utilisation
    if (result.rows && result.rows.length > 0) {
        await db.execute({
            sql: 'DELETE FROM verification_codes WHERE email = ?',
            args: [email]
        });
        return true;
    }
    
    return false;
}

/**
 * Contrôleur pour la demande de connexion admin
 * @param {Object} c - Contexte Hono
 * @returns {Promise<Response>}
 */
export const requestAdminLogin = async (c) => {
    try {
        const { email } = await c.req.json();
        
        if (!email) {
            return c.json({ success: false, message: 'Email requis' }, 400);
        }
        
        if (!isAdminEmail(email)) {
            return c.json({ success: false, message: 'Accès non autorisé' }, 403);
        }
        
        // Nettoyer les codes expirés
        await cleanupExpiredCodes();
        
        // Générer et sauvegarder le code
        const code = await createVerificationCode(email);
        
        // Envoyer l'email avec le code
        await sendVerificationEmail(email, code);
        
        return c.json({
            success: true,
            message: 'Un code de vérification a été envoyé à votre adresse email'
        });
        
    } catch (error) {
        console.error('Erreur lors de la demande de connexion admin:', error);
        return c.json({ 
            success: false, 
            message: 'Une erreur est survenue lors de la demande de connexion' 
        }, 500);
    }
};

/**
 * Generate JWT access token
 * @param {string} email - User email
 * @returns {string} JWT token
 */
const generateAccessToken = (email) => {
    return jwt.sign(
        { email },
        process.env.WT_SECRET,
        { expiresIn: '1d' }
    );
};

/**
 * Generate refresh token
 * @param {string} email - User email
 * @returns {string} Refresh token
 */
const generateRefreshToken = (email) => {
    return jwt.sign(
        { email },
        process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
        { expiresIn: '30d' }
    );
};

/**
 * Contrôleur pour la vérification du code
 * @param {Object} c - Contexte Hono
 * @returns {Promise<Response>}
 */
export const verifyAdminCode = async (c) => {
    try {
        const { email, code } = await c.req.json();
        
        if (!email || !code) {
            return c.json({ 
                success: false, 
                message: 'Email et code requis' 
            }, 400);
        }
        
        if (!isAdminEmail(email)) {
            return c.json({ 
                success: false, 
                message: 'Accès non autorisé' 
            }, 403);
        }
        
        // Vérifier le code
        const isValid = await verifyCode(email, code);
        
        if (!isValid) {
            return c.json({ 
                success: false, 
                message: 'Code invalide ou expiré' 
            }, 400);
        }
        
        // Generate tokens
        const accessToken = generateAccessToken(email);
        const refreshToken = generateRefreshToken(email);
        
        // Calcul de la durée d'expiration en secondes
        const refreshTokenExpiry = process.env.NODE_ENV === 'production' ? 
            7 * 24 * 60 * 60 : // 7 jours en production
            30 * 24 * 60 * 60;  // 30 jours en développement

        // Cookie HTTP-only sécurisé pour le refresh token
        c.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refreshTokenExpiry * 1000, // en millisecondes
            path: '/api/auth/refresh-token',
            domain: process.env.NODE_ENV === 'production' ? '.pages.dev' : undefined
        });

        // Cookie supplémentaire pour la vérification côté client
        c.cookie('isLoggedIn', '1', {
            httpOnly: false, // Doit être accessible en JS
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refreshTokenExpiry * 1000,
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.pages.dev' : undefined
        });
        
        return c.json({
            success: true,
            message: 'Connexion réussie',
            accessToken,
            user: { email }
        });
        
    } catch (error) {
        console.error('Erreur lors de la vérification du code:', error);
        return c.json({ 
            success: false, 
            message: 'Une erreur est survenue lors de la vérification du code' 
        }, 500);
    }
};

// Planifier le nettoyage des codes expirés toutes les 24 heures
setInterval(cleanupExpiredCodes, 24 * 60 * 60 * 1000);

// Exporter les fonctions pour les tests
export {
    generateVerificationCode,
    isAdminEmail,
    createVerificationCode,
    verifyCode,
    cleanupExpiredCodes
};
