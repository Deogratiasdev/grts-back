-- Création de la table analytics pour le suivi des visiteurs
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,           -- ID unique du visiteur (localStorage)
  ip TEXT NOT NULL,              -- Adresse IP du visiteur
  page TEXT NOT NULL,            -- Page visitée (index, contact, 404)
  count INTEGER DEFAULT 1,       -- Nombre de visites
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics(page);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_id ON analytics(id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER IF NOT EXISTS update_analytics_timestamp 
AFTER UPDATE ON analytics
BEGIN
  UPDATE analytics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
