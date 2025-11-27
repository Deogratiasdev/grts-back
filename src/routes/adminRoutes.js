import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { cors } from 'hono/cors';
import { 
  addAdmin, 
  removeAdmin, 
  listAdmins, 
  isAdmin, 
  sendAdminLoginEmail, 
  verifyAdminToken, 
  getAdminProfile,
  getDashboardStats
} from '../controllers/adminController.js';

const router = new Hono();

// Middleware CORS
router.use('*', cors({
  origin: ['http://localhost:8080', 'http://10.10.11.50:8080', 'https://grts.pages.dev'],
  credentials: true
}));

// Middleware pour vérifier le token JWT
const verifyToken = async (c, next) => {
  // Ne pas vérifier le token pour la route de demande de connexion
  if (c.req.path === '/api/admin/request-login' && c.req.method === 'POST') {
    return next();
  }
  
  // Récupérer le token depuis l'URL (pour la première connexion)
  let token = c.req.query('token');
  
  // Si pas de token dans l'URL, vérifier le header Authorization
  if (!token) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (!token) {
    return c.json({ success: false, error: 'Token manquant' }, 401);
  }
  
  // Vérifier le token JWT
  const decoded = verifyAdminToken(token);
  if (!decoded) {
    return c.json({ success: false, error: 'Token invalide ou expiré' }, 401);
  }
  
  // Ajouter les informations de l'utilisateur à la requête
  c.set('admin', decoded);
  
  await next();
};

// Appliquer la vérification du token à toutes les routes
router.use('*', verifyToken);

// Demander un lien de connexion
router.post(
  '/request-login',
  validator('json', (value, c) => {
    const { email } = value;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ success: false, error: 'Email invalide' }, 400);
    }
    return { email };
  }),
  async (c) => {
    const { email } = c.req.valid('json');
    const result = await sendAdminLoginEmail(email);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }
    
    return c.json({ 
      success: true, 
      message: 'Si cet email est enregistré comme administrateur, vous recevrez un lien de connexion.' 
    });
  }
);

// Récupérer le profil de l'admin connecté
router.get('/me', async (c) => {
  const adminId = c.get('admin').id;
  const result = await getAdminProfile(adminId);
  
  if (!result.success) {
    return c.json({ success: false, error: result.error }, 400);
  }
  
  return c.json({ success: true, data: result.data });
});

// Récupérer les statistiques du tableau de bord
router.get('/stats', async (c) => {
  const result = await getDashboardStats();
  
  if (!result.success) {
    return c.json({ success: false, error: result.error }, 500);
  }
  
  return c.json({ success: true, ...result.stats });
});

// Ajouter un administrateur (protégé)
router.post(
  '/add',
  validator('json', (value, c) => {
    const { email } = value;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ success: false, error: 'Email invalide' }, 400);
    }
    return { email };
  }),
  async (c) => {
    const { email } = c.req.valid('json');
    const result = await addAdmin(email);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }
    
    return c.json({ success: true, message: result.message });
  }
);

// Supprimer un administrateur (protégé)
router.delete(
  '/remove',
  validator('json', (value, c) => {
    const { email } = value;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ success: false, error: 'Email invalide' }, 400);
    }
    return { email };
  }),
  async (c) => {
    const { email } = c.req.valid('json');
    const result = await removeAdmin(email);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }
    
    return c.json({ success: true, message: result.message });
  }
);

// Lister tous les administrateurs (protégé)
router.get('/list', async (c) => {
  const result = await listAdmins();
  
  if (!result.success) {
    return c.json({ success: false, error: result.error }, 500);
  }
  
  return c.json({ success: true, admins: result.admins });
});

export default router;
