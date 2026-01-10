import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from '../utils/logger.js';
import db from '../config/db.js';

const analytics = new Hono();

/**
 * POST /api/analytics
 * Enregistre une visite dans la base de données
 */
analytics.post('/analytics', async (c) => {
  try {
    const { visitorId, page, timestamp, userAgent, referrer, screen, language } = await c.req.json();

    // Validation des données requises
    if (!visitorId || !page) {
      return c.json({
        error: 'Données manquantes',
        required: ['visitorId', 'page']
      }, 400);
    }

    // Récupérer l'IP du client
    const ip = c.req.header('x-forwarded-for') || 
               c.req.header('x-real-ip') || 
               c.env?.CF_CONNECTING_IP || 
               'unknown';

    const client = db;

    // Vérifier si le visiteur existe déjà pour cette page
    const existingVisit = await client.execute({
      sql: 'SELECT * FROM analytics WHERE id = ? AND page = ?',
      args: [visitorId, page]
    });

    let visitCount = 1;

    if (existingVisit.rows.length > 0) {
      // Mettre à jour le compteur de visites existant
      await client.execute({
        sql: 'UPDATE analytics SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND page = ?',
        args: [visitorId, page]
      });
      
      // Récupérer le nouveau compteur
      const updated = await client.execute({
        sql: 'SELECT count FROM analytics WHERE id = ? AND page = ?',
        args: [visitorId, page]
      });
      visitCount = updated.rows[0].count;
      
      logger.info(`Visiteur existant mis à jour: ${visitorId} - Page: ${page} - Visites: ${visitCount}`);
    } else {
      // Insérer une nouvelle visite
      await client.execute({
        sql: `
          INSERT INTO analytics (id, ip, page, count, created_at, updated_at) 
          VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        args: [visitorId, ip, page]
      });
      
      logger.info(`Nouveau visiteur enregistré: ${visitorId} - Page: ${page} - IP: ${ip}`);
    }

    // Statistiques globales
    const totalStats = await client.execute('SELECT COUNT(*) as total, SUM(count) as visits FROM analytics');
    
    return c.json({
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
    logger.error('Erreur lors de l\'enregistrement de la visite:', error);
    return c.json({
      error: 'Erreur serveur',
      message: 'Impossible d\'enregistrer la visite'
    }, 500);
  }
});

/**
 * GET /api/stats
 * Récupère les statistiques globales
 */
analytics.get('/stats', async (c) => {
  try {
    const client = db;

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

    return c.json({
      success: true,
      data: {
        global: globalStats.rows[0],
        byPage: pageStats.rows,
        recent: recentStats.rows
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    return c.json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les statistiques'
    }, 500);
  }
});

/**
 * DELETE /api/analytics/clean
 * Nettoie les anciennes données (maintenance)
 */
analytics.delete('/analytics/clean', async (c) => {
  try {
    const client = db;
    
    // Supprimer les données de plus de 90 jours
    const result = await client.execute({
      sql: 'DELETE FROM analytics WHERE created_at < date("now", "-90 days")',
      args: []
    });

    logger.info(`${result.rowsAffected} anciennes entrées supprimées`);

    return c.json({
      success: true,
      message: `${result.rowsAffected} anciennes entrées supprimées`
    });

  } catch (error) {
    logger.error('Erreur lors du nettoyage:', error);
    return c.json({
      error: 'Erreur serveur',
      message: 'Impossible de nettoyer les données'
    }, 500);
  }
});

export default analytics;
