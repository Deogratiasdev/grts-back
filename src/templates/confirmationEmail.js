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
        padding: 2rem 1rem;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .container {
        width: 100%;
        max-width: 640px;
        margin: 2rem auto;
        background: #ffffff;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.1), 0 10px 15px -5px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(226, 232, 240, 0.8);
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      }
      
      .container:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      .header {
        padding: 2.8rem 2.5rem;
        text-align: center;
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        color: white;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .header::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzUwIiB2aWV3Qm94PSIwIDAgNjAwIDM1MCI+PHBhdGggZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgZD0iTTAgMjI1aDEwMHYxMjVIMHptMTUwIDBoMTAwdjEyNUgxNTB6bTE1MCAwaDEwMHYxMjVIMzAwem0xNTAgMGgxMDB2MTI1SDQ1MHoiLz48L3N2Zz4=') center/cover no-repeat;
        opacity: 0.1;
      }
      
      .header h1 {
        margin: 0 0 0.8rem 0;
        color: white;
        font-weight: 700;
        font-size: 2rem;
        position: relative;
        z-index: 1;
        text-shadow: 0 2px 4px rgba(0,0,0,0.15);
        letter-spacing: -0.5px;
      }
      
      .header p {
        margin: 0;
        color: rgba(255,255,255,0.9);
        font-size: 1em;
        position: relative;
        z-index: 1;
        font-weight: 400;
      }
      
      .content {
        padding: 3rem 2.5rem;
        background: #ffffff;
        position: relative;
      }
      
      h2 {
        color: #e65100;
        margin: 0 0 1.5rem 0;
        font-size: 1.4em;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      h2 i {
        color: #e65100;
      }
      
      p {
        margin: 0 0 1.2em 0;
        line-height: 1.7;
      }
      
      .highlight-box {
        background: linear-gradient(to right, #fff9f5 0%, #ffffff 100%);
        border-left: 4px solid #ff6b35;
        padding: 1.5rem;
        margin: 2rem 0;
        border-radius: 0 8px 8px 0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        position: relative;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .highlight-box:hover {
        transform: translateX(4px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
      }
      
      .next-steps {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-left: 4px solid #4f46e5;
        padding: 1.8rem;
        margin: 2.5rem 0;
        border-radius: 0 8px 8px 0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        position: relative;
        overflow: hidden;
      }
      
      .next-steps::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(to bottom, #4f46e5, #818cf8);
      }
      
      .next-steps h3 {
        color: #4f46e5;
        margin: 0 0 0.8rem 0;
        font-size: 1.2em;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .next-steps ul {
        margin: 0;
        padding-left: 1.5rem;
      }
      
      .next-steps li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
      }
      
      .button-container {
        margin: 2rem 0;
      }
      
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0.9rem 1.75rem;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin: 0.5rem 0;
        text-align: center;
        border: none;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        z-index: 1;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      
      .button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.1);
        z-index: -1;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      }
      
      .button:hover::before {
        transform: scaleX(1);
      }
      
      .button-primary {
        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        color: white;
      }
      
      .button-primary:hover {
        background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.2);
      }
      
      .button-whatsapp {
        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
        color: white;
      }
      
      .button-whatsapp:hover {
        background: linear-gradient(135deg, #1faf57 0%, #0d7a6b 100%);
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(18, 140, 126, 0.3), 0 4px 6px -2px rgba(18, 140, 126, 0.2);
      }
      
      .button-portfolio {
        background-color: #ff6b35;
        color: white;
      }
      
      .button-portfolio:hover {
        background-color: #e65100;
      }
      
      .footer {
        text-align: center;
        padding: 1.75rem 1.5rem;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-top: 1px solid rgba(226, 232, 240, 0.7);
        color: #64748b;
        font-size: 0.85em;
        position: relative;
      }
      
      .footer::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #4f46e5, #25D366);
      }
      
      .footer a {
        color: #4f46e5;
        text-decoration: none;
      }
      
      .footer a:hover {
        text-decoration: underline;
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        body {
          background: #0f172a;
          color: #e2e8f0;
        }
        
        .container {
          background: #1e293b;
          border-color: #334155;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
        }
        
        .header {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-bottom: none;
        }
        
        .header h1 {
          color: #fbbf24;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .header p {
          color: #94a3b8;
        }
        
        .content {
          background: #1e293b;
          color: #e2e8f0;
        }
        
        .highlight-box {
          background: linear-gradient(to right, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
          border-left-color: #f59e0b;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
        
        .next-steps {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-left-color: #818cf8;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
        
        .next-steps h3 {
          color: #818cf8;
        }
        
        .footer {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-top-color: #334155;
          color: #94a3b8;
        }
        
        .footer a {
          color: #818cf8;
        }
        
        .button {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
      }
        .container {
          background: #141e30;
          border: 1px solid #2a3a57;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .content, .content h1, .content h2, .content h3 {
          color: #e1e8f0;
        }
        .signature-name {
          color: #ffffff !important;
        }
        .signature-title {
          color: #94a3b8 !important;
        }
        .next-steps {
          background: rgba(20, 30, 48, 0.6);
          border-left: 4px solid #4f46e5;
          backdrop-filter: blur(10px);
        }
        .next-steps h3 {
          color: #ffffff;
        }
        .next-steps li {
          color: #cbd5e1;
        }
        .footer {
          background: #0f172a;
          border-top: 1px solid #1e293b;
          color: #94a3b8;
        }
        .footer a {
          color: #818cf8;
          transition: color 0.2s ease;
        }
        .footer a:hover {
          color: #6366f1;
        }
      }
      body {
        font-family: 'Plus Jakarta Sans', 'Inter', Arial, sans-serif;
        line-height: 1.7;
        color: #1e293b;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        margin: 0;
        padding: 2rem 1rem;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .container {
        max-width: 580px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.02);
        border: 1px solid #e2e8f0;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .container:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
      }
      .header {
        padding: 2.8rem 2rem;
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        color: white;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .header::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzUwIiB2aWV3Qm94PSIwIDAgNjAwIDM1MCI+PHBhdGggZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgZD0iTTAgMjI1aDEwMHYxMjVIMHptMTUwIDBoMTAwdjEyNUgxNTB6bTE1MCAwaDEwMHYxMjVIMzAwem0xNTAgMGgxMDB2MTI1SDQ1MHoiLz48L3N2Zz4=') center/cover no-repeat;
        opacity: 0.1;
      }
      .content {
        padding: 2.8rem 2.5rem;
        line-height: 1.8;
        color: #334155;
        position: relative;
        background: #ffffff;
      }
      .content h1, .content h2, .content h3 {
        color: #1e293b;
        margin-top: 0;
        font-weight: 700;
        line-height: 1.4;
      }
      .content h1 {
        font-size: 2rem;
        margin-bottom: 1.5rem;
        color: #1e40af;
        position: relative;
        display: inline-block;
      }
      .content h1::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 60px;
        height: 3px;
        background: #4f46e5;
        border-radius: 3px;
      }
      .highlight {
        color: #4f46e5;
        font-weight: 700;
        position: relative;
        z-index: 1;
      }
      .highlight::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 0;
        width: 100%;
        height: 40%;
        background: rgba(79, 70, 229, 0.2);
        z-index: -1;
        transform: rotate(-1deg);
        border-radius: 2px;
      }
      .footer {
        padding: 1.8rem 2.5rem;
        background: #f8f9fa;
        text-align: center;
        font-size: 0.9em;
        color: #64748b;
        border-top: 1px solid #f1f5f9;
        background: linear-gradient(to right, #f8fafc, #f1f5f9, #f8fafc);
      }
      .footer a {
        color: #ff6b35;
        text-decoration: none;
        font-weight: 500;
      }
      .footer a:hover {
        text-decoration: underline;
      }
      .button-container {
        margin: 3rem auto;
        max-width: 520px;
        text-align: center;
      }
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px 24px;
        margin: 0 5px 10px;
        border-radius: 8px;
        color: #2a2a2a;
        text-decoration: none;
        font-weight: 500;
        text-align: center;
        transition: all 0.2s ease;
        min-width: 180px;
        font-size: 0.95em;
        background: transparent;
        border: 1px solid #e0e0e0;
        position: relative;
        overflow: hidden;
        z-index: 1;
      }
      .button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        transition: all 0.2s ease;
        opacity: 0;
        border-radius: 7px;
      }
      
      .button-whatsapp {
        color: #25D366;
        border-color: #25D366;
      }
      .button-whatsapp::before {
        background: rgba(37, 211, 102, 0.1);
      }
      
      .button-portfolio {
        color: #ff6b35;
        border-color: #ff6b35;
      }
      .button-portfolio::before {
        background: rgba(255, 107, 53, 0.1);
      }
      
      .button i {
        font-size: 1.1em;
        transition: transform 0.2s ease;
      }
      
      .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .button:hover::before {
        opacity: 1;
      }
      
      .button:active {
        transform: translateY(0);
        box-shadow: none;
      }
      .next-steps {
        background: #f8fafc;
        border-radius: 14px;
        padding: 2rem;
        margin: 3.5rem auto;
        max-width: 540px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 6px 20px rgba(0,0,0,0.04);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        position: relative;
        overflow: hidden;
        border-left: 4px solid #3b82f6;
      }
      .next-steps::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(to bottom, #4f46e5, #818cf8);
      }
      .next-steps h3 {
        margin: 0 0 1rem 0;
        color: #2a2a2a;
        font-size: 1.1rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #eee;
      }
      .next-steps h3 i {
        color: #ff6b35;
      }
      .next-steps ul {
        padding-left: 1.5rem;
        margin: 0;
      }
      .next-steps li {
        margin-bottom: 0.5rem;
        color: #444;
      }
      .signature {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid #f1f5f9;
        position: relative;
      }
      .signature p {
        margin: 0.5rem 0;
      }
      .signature-name {
        font-size: 1.3em;
        font-weight: 700;
        color: #1e293b;
        letter-spacing: 0.5px;
        margin-bottom: 0.3rem !important;
      }
      .signature-title {
        color: #64748b;
        font-size: 0.95em;
        font-weight: 500;
      }
      @media (max-width: 640px) {
        body {
          padding: 1rem;
          display: block;
        }
        .container {
          margin: 1rem 0;
          border-radius: 12px;
        }
        .header, .content {
          padding: 2rem 1.5rem;
        }
        .content h1 {
          font-size: 1.7rem;
        }
        .button {
          display: block;
          width: 100%;
          margin: 0 0 12px 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Confirmation de réception</h1>
        <p>${currentDate}</p>
      </div>
      
      <div class="content">
        <p>Bonjour ${fullName},</p>
        
        <h2>${config.subject}</h2>
        <p>${fullName},</p>

        <p>${config.intro}</p>

        <div style="padding: 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="width: 80px; height: 80px; background: #e3f2fd; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <i class="fas fa-check-circle" style="font-size: 40px; color: #1e88e5;"></i>
          </div>
          <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 1.6em; font-weight: 700;">
            Message bien reçu !
          </h2>
          <p style="color: #7f8c8d; margin: 0; font-size: 1.05em; line-height: 1.6;">
            Nous avons bien reçu votre message et nous vous en remercions.
          </p>
        </div>
          <p style="margin-bottom: 10px;">
            <strong>Sujet :</strong> ${subjectLine}
          </p>
          ${message ? `
          <div style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #e65100;">
            <p style="margin: 0; color: #4b5563;">${message.replace(/\n/g, '<br>')}</p>
          </div>` : ''}
          <p style="margin: 10px 0 0 0;">${config.body}</p>
        </div>

        <p>${config.closing}</p>

        <div class="next-steps">
          <h3><i class="fas fa-route"></i> Prochaines étapes</h3>
          <p style="margin-bottom: 12px;">Voici comment nous allons procéder :</p>
          <ul>
            ${config.nextSteps.map(step => `<li>${step}</li>`).join('')}
          </ul>
        </div>

        <p style="margin: 1.5rem 0;">
          Je m'engage à vous répondre dans les plus brefs délais, généralement sous 
          <strong>${emailConfig.confirmation.responseTime}</strong>.
        </p>

        <div style="margin: 2.5rem 0; text-align: center;">
          <p style="font-weight: 500; margin-bottom: 1.5rem; color: #e65100; font-size: 1.1em;">
            ${emailConfig.confirmation.contactPrompt}
          </p>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
            <a href="https://wa.me/22990259815" 
               class="button button-whatsapp" 
               target="_blank" 
               style="min-width: 240px;">
              <i class="fab fa-whatsapp"></i> ${emailConfig.confirmation.whatsappCTA}
            </a>
            <a href="${emailConfig.confirmation.signature.portfolio}" 
               class="button button-portfolio" 
               target="_blank" 
               style="min-width: 240px;">
              <i class="fas fa-laptop-code"></i> ${emailConfig.confirmation.portfolioCTA}
            </a>
          </div>
        </div>

        <div style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
          <p style="margin-bottom: 0.5rem;">Cordialement,</p>
          <p style="font-weight: 600; margin: 0; color: #1e40af; font-size: 1.1em;">
            ${emailConfig.confirmation.signature.name}
          </p>
          <p style="margin: 0.25rem 0 0; color: #64748b;">
            ${emailConfig.confirmation.signature.title}
          </p>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 5px 0; color: #64748b;">
          &copy; ${new Date().getFullYear()} ${emailConfig.confirmation.signature.name}. Tous droits réservés.
        </p>
        <p style="margin: 0; font-size: 0.85em;">
          <a href="${emailConfig.confirmation.signature.portfolio}" target="_blank">Portfolio</a> • 
          <a href="mailto:${emailConfig.confirmation.signature.email}">Email</a> • 
          <a href="tel:${emailConfig.confirmation.signature.phone.replace(/\s+/g, '')}">
            ${emailConfig.confirmation.signature.phone}
          </a>
        </p>
      </div>
    </div>
  </body>
</html>
`;
};

export default getConfirmationEmailTemplate;
