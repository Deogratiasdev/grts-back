import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { rateLimiter } from 'hono-rate-limiter';

// Configuration du rate limiter : 1 requête par 2 secondes par IP
const limiter = rateLimiter({
  windowMs: 2000, // 2 secondes
  max: 1, // 1 requête maximum
  message: { error: 'Trop de requêtes. Veuillez attendre 2 secondes.' },
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1',
});

// Middleware CORS
const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://grts.pages.dev'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Route principale pour l'IA
const iaRoute = async (c) => {
  try {
    const { message, conversation_history } = await c.req.json();
    
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Message invalide' }, 400);
    }

    // Clé API Groq depuis les variables d'environnement
    const groqApiKey = process.env.ia_api_key;
    
    if (!groqApiKey) {
      console.error('Clé API Groq non trouvée');
      return c.json({ error: 'Configuration serveur incorrecte' }, 500);
    }

    // Prompt système structuré
    const systemPrompt = `Tu es l'assistant IA du site web de Déo-Gratias HOUNNOU, ici pour aider les visiteurs.

IDENTITÉ:
- Tu es l'assistant du site de: Déo-Gratias HOUNNOU
- Surnom: Grts
- Ton rôle: Aider les visiteurs et gérer le portfolio de Déo-Gratias
      
COMPÉTENCES DE DÉO-GRATIAS (pour information):
Développeur web full-stack et mobile
Front-end: HTML5, CSS3, JavaScript (Vue.js)
Back-end: Node.js, Python, APIs REST
Mobile: Flutter (applications iOS/Android)
Bases de données: SQL, NoSQL

TON RÔLE SUR LE SITE:
- Guider les visiteurs dans leur navigation
- Gérer le portfolio de Déo-Gratias
- Donner des informations sur Déo-Gratias et ses services
- Expliquer les différentes sections du site
- Aider à trouver des informations spécifiques
- Répondre aux questions sur les projets et compétences

COORDONNÉES DE DÉO-GRATIAS:
- Email: gratiashounnou@gmail.com
- Téléphone: +229 90 25 98 15
- WhatsApp: +229 90 25 98 15

PAGES DU SITE:
- #home: présentation générale
- #about: parcours et background
- #expertise: compétences techniques

- #projects: réalisations
- #contact: prise de contact

RÈGLES IMPORTANTES:
1. Tu es un assistant d'aide, PAS un développeur
2. Tu ne sais PAS coder et ne fais PAS de développement
3. REFUSE poliment toute demande de codage ou de développement
4. Guide les visiteurs vers les bonnes sections du site
5. Sois DIRECT, PRÉCIS et TRÈS CONCIS (max 2-3 phrases)
6. Oriente vers le formulaire de contact pour les projets
7. Ne mentionne jamais que tu es une IA
8. Concentre-toi sur l'aide à la navigation
9. JAMAIS d'URLs https:// ou http:// dans tes réponses
10. Pour les emails, écris-les simplement (ex: gratiashounnou@gmail.com)
11. Pour les appels téléphoniques, utilise EXACTEMENT le format tel:+22990259815 (chiffres collés, sans espaces, sans tirets, sans parenthèses)
12. Pour WhatsApp, utilise EXACTEMENT le format wa:+22990259815 (chiffres collés, sans espaces, sans tirets, sans parenthèses)
13. IMPORTANT : Tous les numéros doivent avoir leurs chiffres complètement collés, sans espaces, ni séparateurs, ni caractères supplémentaires
14. UTILISE des EMOJIS pertinents dans tes réponses pour rendre la conversation plus vivante et humaine
15. Sois amical et accessible dans ton ton

CONTEXTE ACTUEL:
Derniers messages de la conversation: ${JSON.stringify(conversation_history || [])}

Question de l'utilisateur: ${message}`;

    // Appel à l'API Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...(conversation_history || []),
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 150,  // Limite pour des réponses courtes
        temperature: 0.5,  // Plus déterminé pour des réponses concises
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur API Groq:', errorData);
      return c.json({ error: 'Service temporairement indisponible' }, 500);
    }

    const data = await response.json();
    const iaResponse = data.choices[0]?.message?.content;

    if (!iaResponse) {
      return c.json({ error: 'Réponse invalide du service' }, 500);
    }

    // Log de la requête pour monitoring
    console.log(`Requête IA: ${message.substring(0, 50)}...`);

    return c.json({
      response: iaResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur serveur IA:', error);
    return c.json({ error: 'Erreur interne du serveur' }, 500);
  }
};

// Route de health check
const healthRoute = (c) => {
  return c.json({ 
    status: 'ok', 
    service: 'grts-ia-api',
    timestamp: new Date().toISOString()
  });
};

// Route 404
const notFoundHandler = (c) => {
  return c.json({ error: 'Endpoint non trouvé' }, 404);
};

export { 
  iaRoute, 
  healthRoute,
  corsMiddleware,
  limiter,
  notFoundHandler 
};
