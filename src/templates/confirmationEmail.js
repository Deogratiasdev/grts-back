// Configuration centrale des messages
const emailConfig = {
  // Messages d'accueil par type de demande
  greetings: {
    'Demande de site web': {
      subject: 'Votre demande de site web',
      intro: 'Merci pour votre intérêt pour mes services de création de site web.',
      body: 'Je suis ravi que vous envisagiez de créer une présence en ligne. Votre projet est important pour moi et je vais l\'examiner avec la plus grande attention.',
      closing: 'Je reviens vers vous très rapidement avec une proposition adaptée à vos besoins.'
    },
    'Amélioration de site existant': {
      subject: 'Votre demande d\'amélioration',
      intro: 'Merci pour votre confiance pour l\'amélioration de votre site web existant.',
      body: 'Je vais examiner attentivement votre site actuel pour vous proposer des solutions d\'optimisation pertinentes et efficaces.',
      closing: 'Je vous ferai parvenir une analyse détaillée et des recommandations personnalisées.'
    },
    'Partenariat': {
      subject: 'Votre proposition de partenariat',
      intro: 'Merci pour votre intérêt pour une collaboration professionnelle.',
      body: 'J\'apprécie votre proposition de partenariat. Je vais l\'étudier avec attention pour évaluer comment nous pourrions travailler ensemble de manière mutuellement bénéfique.',
      closing: 'Je reviens vers vous rapidement pour discuter des possibilités de collaboration.'
    },
    'Proposition de poste': {
      subject: 'Votre proposition d\'opportunité professionnelle',
      intro: 'Je vous remercie pour votre proposition de poste.',
      body: 'J\'ai bien pris connaissance de votre offre et je l\'examine avec intérêt. Je tiens à vous remercier pour la confiance que vous me témoignez.',
      closing: 'Je reviendrai vers vous sous peu pour vous faire part de ma décision.'
    },
    'Demande de devis': {
      subject: 'Votre demande de devis',
      intro: 'Merci pour votre demande de devis personnalisé.',
      body: 'Je vais analyser attentivement vos besoins pour vous proposer une offre sur mesure qui réponde précisément à vos attentes.',
      closing: 'Vous recevrez votre devis détaillé dans les plus brefs délais.'
    },
    'default': {
      subject: 'Confirmation de réception',
      intro: 'Merci pour votre message.',
      body: 'J\'ai bien reçu votre demande et vous en remercie. Je vais l\'examiner avec la plus grande attention.',
      closing: 'Je vous répondrai dans les plus brefs délais.'
    }
  },
  
  // Étapes de suivi par type de demande
  nextSteps: {
    'Demande de site web': [
      'Analyse approfondie de vos besoins et objectifs',
      'Étude de la solution technique la plus adaptée',
      'Présentation d\'une proposition détaillée et personnalisée',
      'Validation du cahier des charges et du planning'
    ],
    'Amélioration de site existant': [
      'Audit complet des performances actuelles',
      'Identification des axes d\'amélioration prioritaires',
      'Présentation d\'un plan d\'action détaillé',
      'Mise en œuvre des optimisations validées'
    ],
    'Partenariat': [
      'Analyse des synergies potentielles',
      'Définition des objectifs communs',
      'Élaboration d\'un plan de collaboration',
      'Mise en place du partenariat'
    ],
    'Proposition de poste': [
      'Examen détaillé de la proposition',
      'Analyse d\'adéquation avec mon profil',
      'Évaluation des opportunités de développement',
      'Retour détaillé sous 5 jours ouvrés'
    ],
    'Demande de devis': [
      'Analyse technique des besoins',
      'Évaluation des ressources nécessaires',
      'Préparation d\'un devis personnalisé',
      'Envoi sous 48 heures ouvrées'
    ],
    'default': [
      'Analyse de votre demande',
      'Traitement en cours par nos équipes',
      'Retour personnalisé sous 24 à 48 heures'
    ]
  },
  
  // Messages de confirmation
  confirmation: {
    responseTime: '24-48 heures',
    contactPrompt: 'Besoin d\'une réponse rapide ?',
    whatsappCTA: 'Discutons-en sur WhatsApp',
    portfolioCTA: 'Découvrir mon portfolio',
    signature: {
      name: 'HOUNNOU Déo-Gratias',
      title: 'Développeur Full Stack',
      email: 'deogratiashounnou1@gmail.com',
      phone: '+229 90 25 98 15',
      portfolio: 'https://grts.pages.dev'
    }
  }
};

// Fonctions utilitaires
const getConfig = (type) => ({
  ...emailConfig.greetings[type] || emailConfig.greetings.default,
  nextSteps: emailConfig.nextSteps[type] || emailConfig.nextSteps.default
});

const formatDate = () => {
  return new Date().toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getConfirmationEmailTemplate = ({ prenom, nom, sujet, message }) => {
  const fullName = prenom ? `${prenom} ${nom || ''}`.trim() : "Cher client";
  const subjectLine = sujet || 'votre demande';
  const config = getConfig(sujet);
  const currentDate = formatDate();

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Confirmation de réception - HOUNNOU Déo-Gratias</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
      
      body {
        font-family: 'Inter', 'Plus Jakarta Sans', Arial, sans-serif;
        line-height: 1.6;
        color: #1e293b;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .email-container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px 0;
        background-color: #f5f7fa;
      }
      
      .card {
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        border: 1px solid #e9ecef;
      }
      
      .header {
        background: linear-gradient(135deg, #ff6b35, #e65100);
        color: white;
        padding: 40px 20px;
        text-align: center;
        border-bottom: 4px solid #e65100;
      }
      
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      
      .content {
        padding: 40px;
        background: #ffffff;
        line-height: 1.7;
        color: #4a5568;
      }
      
      .greeting {
        font-size: 18px;
        color: #2d3748;
        margin-bottom: 25px;
        font-weight: 500;
      }
      
      .message-box {
        background: #f8f9fa;
        border-left: 4px solid #e65100;
        padding: 15px 20px;
        margin: 20px 0;
        border-radius: 0 4px 4px 0;
        font-style: italic;
        color: #4a5568;
      }
      
      .info-box {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
        border: 1px solid #e9ecef;
      }
      
      .info-item {
        margin-bottom: 10px;
        display: flex;
        align-items: flex-start;
      }
      
      .info-item i {
        color: #e65100;
        margin-right: 10px;
        margin-top: 3px;
        min-width: 20px;
        text-align: center;
      }
      
      .button {
        display: inline-block;
        padding: 12px 24px;
        background: #e65100;
        color: white !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        margin: 10px 5px;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
      }
      
      .button:hover {
        background: #cc4700;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(230, 81, 0, 0.2);
      }
      
      .button-whatsapp {
        background: #25D366 !important;
      }
      
      .button-whatsapp:hover {
        background: #1da851 !important;
      }
      
      .divider {
        height: 1px;
        background: #e9ecef;
        margin: 30px 0;
        border: none;
      }
      
      .footer {
        background: #f8f9fa;
        padding: 20px 40px;
        text-align: center;
        color: #718096;
        font-size: 14px;
        border-top: 1px solid #e9ecef;
      }
      
      .social-links {
        margin: 15px 0;
      }
      
      .social-link {
        display: inline-block;
        margin: 0 8px;
        color: #718096;
        text-decoration: none;
        transition: color 0.3s;
      }
      
      .social-link:hover {
        color: #e65100;
      }
      
      @media only screen and (max-width: 600px) {
        .content, .header {
          padding: 30px 20px;
        }
        
        .card {
          margin: 0 10px;
          width: auto !important;
        }
        
        .button {
          display: block;
          width: 100%;
          margin: 10px 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="card">
        <!-- Header -->
        <div class="header">
          <h1>Confirmation de réception</h1>
          <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Votre message nous est bien parvenu</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          <h2><i class="fas fa-check-circle"></i> Message bien reçu !</h2>
          
          <p class="greeting">Bonjour <strong>${fullName}</strong>,</p>
          
          <p>Nous vous remercions pour votre message concernant <strong>${subjectLine}</strong>.</p>
          
          <p>Notre équipe a bien pris en compte votre demande et vous répondra dans les plus brefs délais. Nous faisons de notre mieux pour traiter chaque demande dans un délai de 24 à 48 heures ouvrées.</p>
          
          <div class="info-box">
            <div class="info-item">
              <i class="fas fa-info-circle"></i>
              <div>
                <strong>Numéro de suivi :</strong> #${Math.random().toString(36).substr(2, 9).toUpperCase()}
              </div>
            </div>
            <div class="info-item">
              <i class="far fa-clock"></i>
              <div>
                <strong>Date de réception :</strong> ${currentDate}
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-headset"></i>
              <div>
                <strong>Notre équipe est à votre disposition</strong> pour toute question complémentaire.
              </div>
            </div>
          </div>
          
          ${message ? `
          <p style="margin-top: 25px;">Voici un récapitulatif de votre message :</p>
          
          <div class="message-box">
            ${message}
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 35px 0 25px;">
            <a href="https://wa.me/22990259815" class="button button-whatsapp">
              <i class="fab fa-whatsapp" style="margin-right: 8px;"></i> Discuter sur WhatsApp
            </a>
            <a href="https://grts.pages.dev" class="button" target="_blank">
              <i class="fas fa-laptop-code" style="margin-right: 8px;"></i> Voir mon portfolio
            </a>
          </div>
          
          <hr class="divider">
          
          <p style="color: #718096; font-size: 14px; line-height: 1.6;">
            <i class="fas fa-info-circle" style="color: #e65100; margin-right: 5px;"></i>
            <strong>Note importante :</strong> Ceci est un message automatique. Veuillez ne pas y répondre directement.
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="social-links">
            <a href="#" class="social-link" title="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="social-link" title="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="social-link" title="LinkedIn">
              <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="#" class="social-link" title="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
          <p>  ${new Date().getFullYear()} HOUNNOU Déo-Gratias - Tous droits réservés</p>
          <p class="mb-0">
            <a href="#" style="color: #718096; text-decoration: none; margin: 0 10px;">Politique de confidentialité</a>
            <span>•</span>
            <a href="#" style="color: #718096; text-decoration: none; margin: 0 10px;">Contact</a>
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};

export default getConfirmationEmailTemplate;
