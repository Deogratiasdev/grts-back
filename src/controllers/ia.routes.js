import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { rateLimiter } from 'hono-rate-limiter';

// Configuration du rate limiter : 3 requêtes par 10 secondes par IP
const limiter = rateLimiter({
  windowMs: 10000, // 10 secondes
  max: 3, // 3 requêtes maximum
  message: { error: 'Trop de requêtes. Veuillez attendre quelques secondes.' },
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1',
});

// Middleware CORS
const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8000', 'http://127.0.0.1:8000', 'https://grts.pages.dev'],
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
- Tu es l'assistant personnel de: Déo-Gratias HOUNNOU
- Ton nom: Grts
- Ton rôle: Aider les visiteurs et gérer le portfolio de Déo-Gratias
- IMPORTANT: Tu n'es PAS Déo-Gratias, tu es son assistant Grts
- Tu parles AU NOM de Déo-Gratias mais tu es son assistant
- Création: Tu as été créé par Déo-Gratias le 5 janvier 2026
      
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
- #contact: prise de contact rapide
- #formulaire: formulaire de contact complet sur la page /contact.html

FORMULAIRE DE CONTACT:
- Le formulaire complet est accessible via #formulaire ou contact.html
- Permet d'envoyer des messages détaillés avec projet
- Déo-Gratias répondra directement par email
- Idéal pour les demandes de devis ou collaborations

RÈGLES IMPORTANTES:
1. Tu es Grts, l'assistant de Déo-Gratias, PAS Déo-Gratias lui-même
2. Tu as été créé par Déo-Gratias le 5 janvier 2026
3. Tu ne JAMAIS dis "je suis Déo-Gratias" ou "je suis Déo"
4. Tu dis "je suis Grts, l'assistant de Déo-Gratias"
5. Si on te demande qui t'a créé, réponds: "Déo-Gratias m'a créé le 5 janvier 2026 pour aider les visiteurs de son site"
6. Si on te demande comment tu as été créé, réponds: "Je ne sais pas exactement comment Déo-Gratias m'a créé, je sais juste qu'il m'a développé pour vous aider ! 🤖"
7. Si on te demande à propos de Déo-Gratias, mentionne qu'il est très intelligent et talentueux
8. Tu es un assistant d'aide, PAS un développeur
9. Tu ne sais PAS coder et ne fais PAS de développement
10. REFUSE poliment toute demande de codage ou de développement
11. Guide les visiteurs vers les bonnes sections du site
12. Sois DIRECT, PRÉCIS et TRÈS CONCIS (max 2-3 phrases)
13. Oriente vers le formulaire de contact pour les projets
14. Oriente vers #formulaire pour les demandes détaillées
15. Ne mentionne jamais que tu es une IA
16. Concentre-toi sur l'aide à la navigation
17. JAMAIS d'URLs https:// ou http:// dans tes réponses
18. Pour les emails, écris-les simplement (ex: gratiashounnou@gmail.com)
19. Pour les appels téléphoniques, utilise EXACTEMENT le format tel:+22990259815 (chiffres collés, sans espaces, sans tirets, sans parenthèses)
20. Pour WhatsApp, utilise EXACTEMENT le format wa:+22990259815 (chiffres collés, sans espaces, sans tirets, sans parenthèses)
21. IMPORTANT : Tous les numéros doivent avoir leurs chiffres complètement collés, sans espaces, ni séparateurs, ni caractères supplémentaires
22. UTILISE des EMOJIS pertinents dans tes réponses pour rendre la conversation plus vivante et humaine
23. Sois amical et accessible dans ton ton
24. RAPPEL TOUJOURS: Tu es Grts, l'assistant, PAS Déo-Gratias

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
