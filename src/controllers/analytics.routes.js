const express = require('express');
const router = express.Router();
const { createClient } = require('@libsql/client');
require('dotenv').config();

// Initialisation du client Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Middleware pour logger les requêtes analytics
 */
const logAnalyticsRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Analytics request: ${req.method} ${req.path}`);
  next();
};

/**
 * POST /api/analytics
 * Enregistre une visite dans la base de données
 */
router.post('/analytics', logAnalyticsRequest, async (req, res) => {
  try {
    const { visitorId, page, timestamp, userAgent, referrer, screen, language } = req.body;

    // Validation des données requises
    if (!visitorId || !page) {
      return res.status(400).json({
        error: 'Données manquantes',
        required: ['visitorId', 'page']
      });
    }

    // Récupérer l'IP du client
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
               (req.connection.socket ? req.connection.socket.remoteAddress : null) || 
               'unknown';

    // Vérifier si le visiteur existe déjà pour cette page
    const existingVisit = await client.execute({
      sql: 'SELECT * FROM analytics WHERE id = ? AND page = ?',
      args: [visitorId, page]
    });

    let result;
    let visitCount = 1;

    if (existingVisit.rows.length > 0) {
      // Mettre à jour le compteur de visites existant
      result = await client.execute({
        sql: 'UPDATE analytics SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND page = ?',
        args: [visitorId, page]
      });
      
      // Récupérer le nouveau compteur
      const updated = await client.execute({
        sql: 'SELECT count FROM analytics WHERE id = ? AND page = ?',
        args: [visitorId, page]
      });
      visitCount = updated.rows[0].count;
      
      console.log(`Visiteur existant mis à jour: ${visitorId} - Page: ${page} - Visites: ${visitCount}`);
    } else {
      // Insérer une nouvelle visite
      result = await client.execute({
        sql: `
          INSERT INTO analytics (id, ip, page, count, created_at, updated_at) 
          VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        args: [visitorId, ip, page]
      });
      
      console.log(`Nouveau visiteur enregistré: ${visitorId} - Page: ${page} - IP: ${ip}`);
    }

    // Statistiques globales (optionnel, pour monitoring)
    const totalStats = await client.execute('SELECT COUNT(*) as total, SUM(count) as visits FROM analytics');
    
    res.json({
      success: true,
      message: existingVisit.rows.length > 0 ? 'Visite mise à jour' : 'Nouvelle visite enregistrée',
      data: {
        visitorId,
        page,
        ip,
        visitCount,
        isNewVisitor: existingVisit.rows.length === 0
      },
      stats: {
        totalVisitors: totalStats.rows[0].total,
        totalVisits: totalStats.rows[0].visits
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la visite:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible d\'enregistrer la visite'
    });
  }
});

/**
 * GET /api/stats
 * Récupère les statistiques globales
 */
router.get('/stats', logAnalyticsRequest, async (req, res) => {
  try {
    // Statistiques globales
    const globalStats = await client.execute(`
      SELECT 
        COUNT(DISTINCT id) as unique_visitors,
        SUM(count) as total_visits,
        COUNT(DISTINCT ip) as unique_ips
      FROM analytics
    `);

    // Statistiques par page
    const pageStats = await client.execute(`
      SELECT 
        page,
        COUNT(DISTINCT id) as unique_visitors,
        SUM(count) as total_visits,
        MIN(created_at) as first_visit,
        MAX(updated_at) as last_visit
      FROM analytics
      GROUP BY page
      ORDER BY total_visits DESC
    `);

    // Statistiques des derniers jours
    const recentStats = await client.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT id) as new_visitors,
        SUM(count) as visits
      FROM analytics
      WHERE created_at >= date('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: {
        global: globalStats.rows[0],
        byPage: pageStats.rows,
        recent: recentStats.rows
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les statistiques'
    });
  }
});

/**
 * GET /api/analytics/clean
 * Nettoie les anciennes données (optionnel, maintenance)
 */
router.delete('/analytics/clean', async (req, res) => {
  try {
    // Supprimer les données de plus de 90 jours
    const result = await client.execute({
      sql: 'DELETE FROM analytics WHERE created_at < date("now", "-90 days")',
      args: []
    });

    res.json({
      success: true,
      message: `${result.rowsAffected} anciennes entrées supprimées`
    });

  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de nettoyer les données'
    });
  }
});

module.exports = router;
