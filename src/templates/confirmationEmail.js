const getSubjectConfirmation = (sujet, prenom, nom) => {
  const name = prenom || nom ? `${prenom || ''} ${nom || ''}`.trim() : 'Cher client';
  
  const messages = {
    'Demande de site web': `Merci pour votre intérêt pour mes services de création de site web.`, 
    'Amélioration de site existant': `Merci pour votre demande d'amélioration de site web.`,
    'Partenariat': `Merci pour votre intérêt pour un partenariat.`,
    'Proposition de poste': `Merci pour votre proposition de poste.`,
    'Demande de devis': `Merci pour votre demande de devis.`,
    'Autre': `Merci pour votre message.`,
  };

  return messages[sujet] || `Merci pour votre message.`;
};

const getNextSteps = (sujet) => {
  const steps = {
    'Demande de site web': [
      'Analyse détaillée de vos besoins',
      'Proposition de solution personnalisée',
      'Établissement d\'un devis détaillé'
    ],
    'Amélioration de site existant': [
      'Audit de votre site actuel',
      'Recommandations d\'amélioration',
      'Proposition de plan d\'action'
    ],
    'Partenariat': [
      'Analyse des opportunités de collaboration',
      'Proposition de partenariat gagnant-gagnant',
      'Mise en place des modalités de collaboration'
    ],
    'Proposition de poste': [
      'Examen attentif de votre proposition',
      'Analyse de compatibilité avec mes compétences',
      'Retour sous les plus brefs délais'
    ],
    'Demande de devis': [
      'Analyse détaillée de votre demande',
      'Préparation d\'un devis personnalisé',
      'Envoi sous 24 à 48 heures ouvrées'
    ]
  };

  return steps[sujet] || [
    'Analyse de votre demande',
    'Retour personnalisé sous 24 à 48 heures'
  ];
};

export const getConfirmationEmailTemplate = ({ prenom, nom, sujet, message }) => {
  const fullName = prenom ? `${prenom} ${nom || ''}`.trim() : "Cher client";
  const subjectLine = sujet || 'votre demande';
  
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
      @media (prefers-color-scheme: dark) {
        body {
          background: #0f1114;
        }
        .container {
          background: #1a1d23;
          border-color: #2a2f3b;
        }
        .content, .content h1, .content h2, .content h3 {
          color: #e1e1e1;
        }
        .signature-name {
          color: #ffffff !important;
        }
        .signature-title {
          color: #a0aec0 !important;
        }
        .next-steps {
          background: #252a34;
          border-left-color: #ff6b35;
        }
        .next-steps h3 {
          color: #ffffff;
        }
        .next-steps li {
          color: #cbd5e0;
        }
        .footer {
          background: #1a1d23;
          border-top-color: #2a2f3b;
          color: #a0aec0;
        }
        .footer a {
          color: #ff8c5a;
        }
      }
      body {
        font-family: 'Inter', Arial, sans-serif;
        line-height: 1.7;
        color: #333;
        background: #f9f9f9;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .container {
        max-width: 600px;
        margin: 2rem auto;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border: 1px solid #eaeaea;
      }
      .header {
        padding: 2.5rem 2rem;
        background: linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%);
        color: white;
        text-align: center;
        border-bottom: 4px solid #ff6b35;
      }
      .content {
        padding: 2.5rem;
        line-height: 1.8;
        color: #333;
      }
      .content h1, .content h2, .content h3 {
        color: #0a0a0a;
        margin-top: 0;
      }
      .content h1 {
        font-size: 1.8rem;
        margin-bottom: 1.5rem;
        color: #ff6b35;
      }
      .highlight {
        color: #ff6b35;
        font-weight: 600;
      }
      .footer {
        padding: 1.5rem 2rem;
        background: #f8f9fa;
        text-align: center;
        font-size: 0.9em;
        color: #666;
        border-top: 1px solid #eee;
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
        margin: 2.5rem 0;
        text-align: center;
      }
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px 28px;
        margin: 0 10px 15px;
        border-radius: 12px;
        color: white;
        text-decoration: none;
        font-weight: 600;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 240px;
        font-size: 1.05em;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
        border: none;
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
        background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
        z-index: -1;
        transition: opacity 0.3s ease;
        opacity: 0.8;
      }
      .button:hover::before {
        opacity: 1;
      }
      .button i {
        font-size: 1.2em;
        transition: transform 0.3s ease;
      }
      .button:hover i {
        transform: translateX(3px);
      }
      .button-whatsapp {
        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .button-portfolio {
        background: linear-gradient(135deg, #ff6b35 0%, #e94e1b 100%);
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .button:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        opacity: 0.98;
      }
      .button:active {
        transform: translateY(1px) scale(0.99);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      .next-steps {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 2rem 0;
        border-left: 4px solid #ff6b35;
      }
      .next-steps h3 {
        margin-top: 0;
        color: #2a2a2a;
        font-size: 1.2rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 10px;
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
        margin-top: 2.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #eee;
      }
      .signature p {
        margin: 0.5rem 0;
      }
      .signature-name {
        font-size: 1.2em;
        font-weight: 700;
        color: #0a0a0a;
      }
      .signature-title {
        color: #666;
        font-size: 0.95em;
      }
      @media (max-width: 600px) {
        .container {
          margin: 0;
          border-radius: 0;
        }
        .header, .content {
          padding: 1.5rem;
        }
        .button {
          display: block;
          width: 100%;
          margin: 0 0 15px 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Confirmation de réception</h1>
        <p>Votre demande a bien été enregistrée</p>
      </div>
      
      <div class="content">
        <h1>Bonjour <span class="highlight">${fullName}</span>,</h1>
        
        <p>${getSubjectConfirmation(sujet, prenom, nom)}</p>
        
        <p>J'ai bien pris en compte votre demande concernant <strong>${subjectLine}</strong> et je vous remercie de l'intérêt que vous portez à mon travail.</p>
        
        <div class="next-steps">
          <h3><i class="fas fa-arrow-right"></i> Prochaines étapes :</h3>
          <ul>
            ${getNextSteps(sujet).map(step => `<li>${step}</li>`).join('')}
          </ul>
        </div>
        
        <p>Je m'engage à vous répondre dans les plus brefs délais, généralement sous <strong>24 à 48 heures</strong>.</p>
        
        <div class="button-container">
          <a href="https://wa.me/22990259815" class="button button-whatsapp" target="_blank">
            <i class="fab fa-whatsapp"></i> Me contacter sur WhatsApp
          </a>
          <a href="https://grts.pages.dev" class="button button-portfolio" target="_blank">
            <i class="fas fa-laptop-code"></i> Voir mon portfolio
          </a>
        </div>
        
        <div class="signature">
          <p class="signature-name">Déo-Gratias HOUNNOU</p>
          <p class="signature-title">Développeur Full Stack</p>
          <p style="margin-top: 1rem;">
            <a href="tel:+22990259815" style="color: #ff6b35; text-decoration: none;">
              <i class="fas fa-phone-alt"></i> +229 90 25 98 15
            </a>
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} HOUNNOU Déo-Gratias. Tous droits réservés.</p>
        <p>
          <a href="mailto:gratiashounnou@gmail.com">gratiashounnou@gmail.com</a>
          <span style="margin: 0 10px; color: #ddd">•</span>
          <a href="https://grts.pages.dev">grts.pages.dev</a>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
};
