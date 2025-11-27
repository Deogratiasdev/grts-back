export const getAdminNotificationTemplate = (formData) => {
  const contactMethod = formData.whatsapp ? 'WhatsApp' : 'Téléphone';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Inter', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 2rem; 
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
          text-align: center; 
          padding: 1.5rem 0;
          background: #2c3e50;
          color: white;
          border-radius: 8px 8px 0 0;
          margin: -2rem -2rem 2rem -2rem;
        }
        .content { 
          padding: 0 1.5rem 2rem; 
        }
        .details {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          border-left: 4px solid #ff6b35;
        }
        .footer { 
          text-align: center; 
          margin-top: 2rem; 
          padding-top: 1.5rem; 
          border-top: 1px solid #eee;
          color: #777;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Nouvelle soumission de formulaire</h2>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Une nouvelle soumission de formulaire a été reçue avec les détails suivants :</p>
          
          <div class="details">
            <p><strong>Nom :</strong> ${formData.prenom || 'Non spécifié'} ${formData.nom || 'Non spécifié'}</p>
            <p><strong>Email :</strong> ${formData.email}</p>
            <p><strong>Téléphone :</strong> ${formData.telephone} (${contactMethod})</p>
            <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <p><strong>Message :</strong></p>
            <p>${formData.projet || 'Aucun message'}</p>
          </div>
          
          <p>Veuillez répondre à ce message dans les plus brefs délais.</p>
          
          <p>Cordialement,<br>Votre application de formulaire</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Déo-Gratias. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
