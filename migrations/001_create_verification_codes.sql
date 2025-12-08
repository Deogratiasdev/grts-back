-- Création de la table verification_codes
CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(email) ON CONFLICT REPLACE
);

-- Création d'un index pour accélérer les recherches par email
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);

-- Création d'un index pour le nettoyage des codes expirés
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);
