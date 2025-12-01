const getSubjectMessage = (subject, prenom, nom, projet) => {
  const name = prenom || nom ? `${prenom || ''} ${nom || ''}`.trim() : 'le visiteur';
  
  const messages = {
    'Demande de site web': `${name} souhaite discuter de la création d'un nouveau site web.`,
    'Amélioration de site existant': `${name} a besoin d'aide pour améliorer son site existant.`,
    'Partenariat': `${name} est intéressé(e) par un partenariat.`,
    'Proposition de poste': `${name} vous a envoyé une proposition de poste.`,
    'Demande de devis': `${name} souhaite obtenir un devis personnalisé.`,
    'Autre': `${name} a une demande particulière à vous soumettre.`,
  };

  return messages[subject] || `${name} vous a contacté via votre formulaire.`;
};

export const getAdminNotificationTemplate = ({ prenom, nom, email, telephone, projet, sujet, whatsapp }) => {
  const fullName = prenom && nom ? `${prenom} ${nom}` : 'Un visiteur';
  const contactMethod = whatsapp && telephone ? 
    `<a href="https://wa.me/${telephone.replace(/[^0-9+]/g, '')}" style="color: #25D366; text-decoration: none;">WhatsApp</a>` : 
    'par email';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Nouveau message de contact - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
        .detail-label {
          color: #a0aec0 !important;
        }
        .detail-value {
          color: #e2e8f0 !important;
        }
        .details {
          background: #252a34;
          border-color: #2a2f3b;
        }
        .detail-item {
          border-color: #2a2f3b !important;
        }
        .footer {
          background: #1a1d23;
          border-top-color: #2a2f3b;
          color: #a0aec0;
        }
        .footer a {
          color: #ff8c5a;
        }
        .detail-item[style*="background: #fff8e6"] {
          background: #2d261a !important;
          border-left: 4px solid #ff6b35 !important;
        }
        .detail-item[style*="color: #e65100"] {
          color: #ff9e4f !important;
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
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        border: 1px solid #eee;
      }
      .header {
        padding: 2rem;
        background: #1a1a2e;
        color: white;
        text-align: center;
      }
      .content {
        padding: 2rem;
        line-height: 1.8;
        color: #333;
      }
      .content h2 {
        color: #1a1a2e;
        margin-top: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }
      .content p {
        margin: 1.2rem 0;
        color: #333;
      }
      .highlight {
        color: #ff6b35;
        font-weight: 500;
      }
      .footer {
        padding: 1.5rem 2rem;
        background: #f5f5f5;
        text-align: center;
        font-size: 0.9em;
        color: #666;
        border-top: 1px solid #eee;
      }
      .footer a {
        color: #ff6b35;
        text-decoration: none;
      }
      .button-container {
        margin: 2rem 0;
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
      .button-email {
        background: linear-gradient(135deg, #4a6cf7 0%, #3a56d4 100%);
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .button-whatsapp {
        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
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
      .details {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 1.5rem;
        margin: 1.5rem 0;
      }
      .detail-item {
        margin-bottom: 0.8rem;
        padding-bottom: 0.8rem;
        border-bottom: 1px solid #eee;
      }
      .detail-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      .detail-label {
        font-weight: 600;
        color: #555;
        display: block;
        margin-bottom: 0.3rem;
      }
      .detail-value {
        color: #222;
        word-break: break-word;
      }
      @media (max-width: 600px) {
        .container {
          margin: 0;
          border-radius: 0;
        }
        .header, .content {
          padding: 1.5rem;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Nouveau message de contact</h1>
      </div>
      <div class="content">
        <p>Bonjour Déo-Gratias,</p>
        <p>${getSubjectMessage(sujet, prenom, nom, projet)}</p>
        
        <div class="details">
          <div class="detail-item">
            <span class="detail-label">Type de demande :</span>
            <div class="detail-value">${sujet || 'Non spécifié'}</div>
          </div>
          <div class="detail-item">
            <span class="detail-label">Projet :</span>
            <div class="detail-value">${projet ? projet.replace(/\n/g, '<br>') : 'Aucun détail supplémentaire fourni.'}</div>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Coordonnées :</span>
            <div class="detail-value">
              ${email ? `Email: <a href="mailto:${email}" style="color: #4a6cf7; text-decoration: none;">${email}</a><br>` : ''}
              ${telephone ? `Téléphone: <a href="tel:${telephone}" style="color: #4a6cf7; text-decoration: none;">${telephone}</a>` : ''}
            </div>
          </div>
          
          ${whatsapp ? `
          <div class="detail-item">
            <span class="detail-label">Préférence de contact :</span>
            <div class="detail-value">
              Préfère être contacté(e) via WhatsApp
            </div>
          </div>
          ` : ''}
        </div>

        <div class="button-container">
          ${email ? `
          <a href="mailto:${email}" class="button button-email" style="color:white;text-decoration:none">
            Répondre par email
          </a>
          ` : ''}
          
          ${whatsapp && telephone ? `
          <a href="https://wa.me/${telephone.replace(/[^0-9+]/g, '')}" class="button button-whatsapp" style="color:white;text-decoration:none">
            Contacter sur WhatsApp
          </a>
          ` : ''}
        </div>
        
        ${sujet === 'Autre' ? `
        <div class="detail-item" style="background: #fff8e6; padding: 1rem; border-radius: 6px; margin: 1.5rem 0;">
          <p style="margin: 0; color: #e65100; font-weight: 500;">
            <i class="fas fa-info-circle"></i> Ce visiteur a sélectionné "Autre" comme objet. 
            Veuillez porter une attention particulière à sa demande ci-dessus.
          </p>
        </div>
        ` : ''}
        
        <p>N'oubliez pas de mettre à jour le suivi de ce contact dans votre système.</p>
        
        <p>Cordialement,<br>Votre système de portfolio</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} HOUNNOU Déo-Gratias. Tous droits réservés.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
