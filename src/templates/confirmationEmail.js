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

const getPrefilledMessage = (sujet) => {
  const defaultMessage = "Bonjour Monsieur HOUNNOU Déo-Gratias,\n\nJe vous écris à propos de : **";
  
  const messages = {
    'Demande de site web': `${defaultMessage} création d'un nouveau site web**.\n\nJe souhaiterais obtenir plus d'informations sur vos services et tarifs pour la création d'un site web.\n\nCordialement,`,
    'Amélioration de site existant': `${defaultMessage} amélioration de mon site web existant**.\n\nJ'aimerais discuter des possibilités d'amélioration pour mon site actuel.\n\nCordialement,`,
    'Partenariat': `${defaultMessage} opportunité de partenariat**.\n\nJe souhaiterais échanger sur une possible collaboration.\n\nCordialement,`,
    'Proposition de poste': `${defaultMessage} opportunité professionnelle**.\n\nJe vous contacte concernant une opportunité qui pourrait vous intéresser.\n\nCordialement,`,
    'Demande de devis': `${defaultMessage} demande de devis**.\n\nJ'aimerais obtenir un devis personnalisé pour vos services.\n\nCordialement,`,
    'Autre': `${defaultMessage} [Votre objet]**.\n\n[Votre message]\n\nCordialement,`
  };

  return messages[sujet] || `${defaultMessage} [Votre objet]**.\n\n[Votre message]\n\nCordialement,`;
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
  <script>
    function copyToClipboard() {
      const message = document.querySelector('.prefilled-message div').innerText;
      navigator.clipboard.writeText(message).then(() => {
        const button = document.querySelector('.prefilled-message button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Message copié !';
        button.style.background = '#38a169';
        setTimeout(() => {
          button.innerHTML = originalText;
          button.style.background = '#ff6b35';
        }, 2000);
      });
    }
  </script>
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
        margin: 2.5rem auto;
        max-width: 500px;
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
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 2.5rem auto;
        max-width: 500px;
        border: 1px solid #eaeaea;
        box-shadow: 0 2px 10px rgba(0,0,0,0.03);
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
        
        <div class="prefilled-message" style="background: #f8f9fa; border-left: 4px solid #ff6b35; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
          <p style="margin-top: 0; font-weight: 500; color: #2d3748; margin-bottom: 10px;">Pour me contacter plus facilement, vous pouvez copier ce message :</p>
          <div style="background: white; padding: 12px; border: 1px solid #e2e8f0; border-radius: 4px; font-family: monospace; font-size: 14px; line-height: 1.5; color: #4a5568; white-space: pre-line; margin-bottom: 10px;">
            ${getPrefilledMessage(sujet)}
          </div>
          <button onclick="copyToClipboard()" style="background: #ff6b35; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px;">
            <i class="far fa-copy"></i> Copier le message
          </button>
        </div>
        
        <div class="button-container">
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin: 0 -5px;">
            <a href="https://wa.me/22990259815" class="button button-whatsapp" target="_blank" style="flex: 1 1 200px; min-width: 180px;">
              <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
            <a href="https://grts.pages.dev" class="button button-portfolio" target="_blank" style="flex: 1 1 200px; min-width: 180px;">
              <i class="fas fa-laptop-code"></i> Portfolio
            </a>
          </div>
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
