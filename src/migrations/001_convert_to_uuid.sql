-- Migration pour convertir les IDs en UUID

-- Désactiver les contraintes de clé étrangère
PRAGMA foreign_keys=off;

-- Renommer l'ancienne table
ALTER TABLE contacts RENAME TO contacts_old;

-- Créer la nouvelle table avec UUID
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  prenom TEXT,
  nom TEXT,
  email TEXT NOT NULL UNIQUE,
  telephone TEXT,
  projet TEXT NOT NULL,
  whatsapp BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copier les données de l'ancienne table vers la nouvelle
INSERT INTO contacts (id, prenom, nom, email, telephone, projet, whatsapp, created_at)
SELECT 
  lower(hex(randomblob(16))), 
  prenom, 
  nom, 
  email, 
  telephone, 
  projet, 
  whatsapp, 
  created_at 
FROM contacts_old;

-- Supprimer l'ancienne table
DROP TABLE contacts_old;

-- Réactiver les contraintes de clé étrangère
PRAGMA foreign_keys=on;
