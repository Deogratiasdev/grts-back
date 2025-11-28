export const getConfirmationEmailTemplate = ({ prenom, nom, sujet, message }) => {
  const displayName = prenom ? `${prenom} ${nom || ''}`.trim() : 'Cher client';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de réception - HOUNNOU Déo-Gratias</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
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
          background: #0a0a0a;
          color: white;
          text-align: center;
        }
        .content {
          padding: 2rem;
          line-height: 1.8;
          color: #333;
        }
        .content h2 {
          color: #0a0a0a;
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
        .footer a:hover {
          text-decoration: underline;
        }
        .button-container {
          margin: 2rem 0;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          margin: 0 10px 15px;
          border-radius: 6px;
          color: white;
          text-decoration: none;
          font-weight: 500;
          text-align: center;
          transition: all 0.3s ease;
          min-width: 200px;
        }
        .button-whatsapp {
          background-color: #25D366;
          border: 1px solid #25D366;
        }
        .button-portfolio {
          background-color: #ff6b35;
          border: 1px solid #ff6b35;
        }
        .button:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
          <h1>Confirmation de réception</h1>
        </div>
        
        <div class="content">
          <p>Bonjour <span class="highlight">${displayName}</span>,</p>
          
          <p>Je vous confirme avoir bien reçu votre message. Je vous remercie de l'intérêt que vous portez à mon travail.</p>
          
          <p>Je m'engage à vous répondre dans les plus brefs délais, généralement sous 24 à 48 heures.</p>
          
          <p>Pour toute urgence, vous pouvez me contacter directement au <a href="tel:+22990259815" style="color: #ff6b35; text-decoration: none;">+229 90 25 98 15</a>.</p>
          
          <div class="button-container">
            <a href="https://wa.me/22990259815" class="button button-whatsapp" target="_blank" style="color: white; text-decoration: none;">
              Me contacter sur WhatsApp
            </a>
            <a href="https://grts.pages.dev" class="button button-portfolio" target="_blank" style="color: white; text-decoration: none;">
              Accéder à mon portfolio
            </a>
          </div>
          
          <p>Bien cordialement,</p>
          
          <div class="signature">
            <p><strong>Déo-Gratias HOUNNOU</strong><br>
            Développeur Full Stack</p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} HOUNNOU Déo-Gratias. Tous droits réservés.</p>
          <p>
            <a href="mailto:gratiashounnou@gmail.com">gratiashounnou@gmail.com</a>
            <span style="margin: 0 10px;">•</span>
            <a href="tel:+22990259815">+229 90 25 98 15</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
