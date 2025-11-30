import jwt from 'jsonwebtoken';
import { storeToken, verifyStoredToken, removeExpiredTokens } from '../models/jwtToken.js';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_tres_secret';
const JWT_EXPIRES_IN = '1d';

/**
 * Generate a new JWT token and store it in the database
 * @param {Object} payload - The payload to include in the token
 * @returns {Promise<string>} The generated JWT token
 */
export const generateToken = async (payload) => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const decoded = jwt.decode(token);
  
  // Store the token in the database
  await storeToken(token, payload.userId || 'user', new Date(decoded.exp * 1000));
  
  // Clean up expired tokens
  await removeExpiredTokens();
  
  return token;
};

/**
 * Verify a JWT token against the database
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object|null>} The decoded token if valid, null otherwise
 */
export const verifyToken = async (token) => {
  try {
    // First verify the token signature
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Then check if the token exists in the database and is not expired
    const storedToken = await verifyStoredToken(token);
    if (!storedToken) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from request (cookie or Authorization header)
 * @param {Object} c - Hono context
 * @returns {string|null} The token if found, null otherwise
 */
export const getTokenFromRequest = (c) => {
  // Check cookie first
  const cookieHeader = c.req.header('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=').map(c => c.trim());
      acc[key] = value;
      return acc;
    }, {});
    
    if (cookies.auth_token) {
      return cookies.auth_token;
    }
  }
  
  // Then check Authorization header
  const authHeader = c.req.header('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

/**
 * Remove a token from the database (logout)
 * @param {string} token - The token to revoke
 */
export const revokeToken = async (token) => {
  await removeToken(token);
};
