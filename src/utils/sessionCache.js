class CacheManager {
  constructor() {
    this.sessions = new Map();
    this.allowedEmails = new Map();
    this.verificationCodes = new Map();
    this.ttl = {
      sessions: 7 * 24 * 60 * 60 * 1000, // 7 jours
      allowedEmails: 5 * 60 * 1000, // 5 minutes
      verificationCodes: 15 * 60 * 1000 // 15 minutes
    };
  }

  // Méthodes pour les sessions
  setSession(sessionId, userId, userData) {
    this.sessions.set(sessionId, {
      data: { userId, ...userData },
      expiresAt: Date.now() + this.ttl.sessions
    });
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    return session.data;
  }

  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  // Méthodes pour les emails autorisés
  setAllowedEmail(email, role) {
    this.allowedEmails.set(email, {
      role,
      expiresAt: Date.now() + this.ttl.allowedEmails
    });
  }

  isEmailAllowed(email) {
    const emailData = this.allowedEmails.get(email);
    if (!emailData) return null;
    
    if (emailData.expiresAt < Date.now()) {
      this.allowedEmails.delete(email);
      return null;
    }
    
    return { allowed: true, role: emailData.role };
  }

  // Méthodes pour les codes de vérification
  setVerificationCode(email, code) {
    this.verificationCodes.set(`${email}:${code}`, {
      email,
      code,
      expiresAt: Date.now() + this.ttl.verificationCodes
    });
  }

  verifyCode(email, code) {
    const key = `${email}:${code}`;
    const codeData = this.verificationCodes.get(key);
    
    if (!codeData) return { valid: false, message: 'Code invalide ou expiré' };
    
    if (codeData.expiresAt < Date.now()) {
      this.verificationCodes.delete(key);
      return { valid: false, message: 'Code expiré' };
    }
    
    this.verificationCodes.delete(key);
    return { valid: true };
  }

  // Nettoyage périodique
  startCleanup(interval = 5 * 60 * 1000) {
    setInterval(() => {
      const now = Date.now();
      
      // Nettoyer les sessions expirées
      for (const [key, { expiresAt }] of this.sessions.entries()) {
        if (expiresAt < now) this.sessions.delete(key);
      }
      
      // Nettoyer les emails expirés
      for (const [key, { expiresAt }] of this.allowedEmails.entries()) {
        if (expiresAt < now) this.allowedEmails.delete(key);
      }
      
      // Nettoyer les codes expirés
      for (const [key, { expiresAt }] of this.verificationCodes.entries()) {
        if (expiresAt < now) this.verificationCodes.delete(key);
      }
    }, interval);
  }
}

// Export d'une instance unique
export default new CacheManager();