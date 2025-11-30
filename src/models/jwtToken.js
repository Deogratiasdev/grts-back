import db from '../config/db.js';

/**
 * Store a JWT token in the database
 * @param {string} token - The JWT token to store
 * @param {string} userId - The user ID associated with the token
 * @param {Date} expiresAt - Expiration date of the token
 */
export const storeToken = async (token, userId, expiresAt) => {
  await db.execute({
    sql: 'INSERT INTO jwt_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
    args: [token, userId, expiresAt.toISOString()]
  });
};

/**
 * Verify if a JWT token exists and is not expired
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object|null>} The token data if valid, null otherwise
 */
export const verifyStoredToken = async (token) => {
  const result = await db.execute({
    sql: 'SELECT * FROM jwt_tokens WHERE token = ? AND expires_at > datetime("now")',
    args: [token]
  });

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Remove a JWT token from the database
 * @param {string} token - The JWT token to remove
 */
export const removeToken = async (token) => {
  await db.execute({
    sql: 'DELETE FROM jwt_tokens WHERE token = ?',
    args: [token]
  });
};

/**
 * Remove all expired tokens from the database
 */
export const removeExpiredTokens = async () => {
  await db.execute({
    sql: 'DELETE FROM jwt_tokens WHERE expires_at <= datetime("now")'
  });
};
