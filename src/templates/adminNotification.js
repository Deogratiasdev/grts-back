export const getAdminNotificationTemplate = (formData) => {
  const contactMethod = formData.whatsapp ? 'WhatsApp' : 'Téléphone';
  const displayName = formData.prenom ? `${formData.prenom} ${formData.nom || ''}`.trim() : 'Client';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouveau message - HOUNNOU Déo-Gratias</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body{font-family:'Inter',Arial,sans-serif;line-height:1.7;color:#333;background:#f9f9f9;margin:0;padding:0;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
        .container{max-width:600px;margin:2rem auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);border:1px solid #eee}
        .header{padding:2rem;background:#0a0a0a;color:white;text-align:center}
        .content{padding:2rem;line-height:1.8;color:#333}
        .content h2{color:#0a0a0a;margin-top:0;font-size:1.5rem;font-weight:600}
        .content p{margin:1.2rem 0;color:#333}
        .highlight{color:#ff6b35;font-weight:500}
        .footer{padding:1.5rem 2rem;background:#f5f5f5;text-align:center;font-size:0.9em;color:#666;border-top:1px solid #eee}
        .footer a{color:#ff6b35;text-decoration:none}
        .footer a:hover{text-decoration:underline}
        .button-container{margin:2rem 0;text-align:center}
        .button{display:inline-block;padding:12px 24px;margin:0 10px 15px;border-radius:6px;color:white;text-decoration:none;font-weight:500;text-align:center;transition:all 0.3s ease;min-width:200px}
        .button-email{background-color:#ff6b35;border:1px solid #ff6b35}
        .button-whatsapp{background-color:#25D366;border:1px solid #25D366}
        .button:hover{opacity:0.9;transform:translateY(-2px);box-shadow:0 4px 8px rgba(0,0,0,0.1)}
        .details{background:#f9f9f9;padding:1.5rem;border-radius:8px;margin:1.5rem 0;border-left:4px solid #ff6b35}
        @media (max-width:600px){.container{margin:0;border-radius:0}.header,.content{padding:1.5rem}}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nouveau message de contact</h1>
        </div>
        
        <div class="content">
          <p>Bonjour,</p>
          
          <p>Vous avez reçu un nouveau message de la part de <span class="highlight">${displayName}</span>.</p>
          
          <div class="details">
            <p><strong>Nom complet :</strong> ${displayName}</p>
            <p><strong>Email :</strong> ${formData.email || 'Non fourni'}</p>
            <p><strong>Téléphone :</strong> ${formData.phone || formData.telephone || 'Non fourni'} (${contactMethod})</p>
            <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <p><strong>Sujet :</strong> ${formData.subject || 'Non spécifié'}</p>
            ${formData.message ? `<p><strong>Message :</strong><br>${formData.message}</p>` : ''}
          </div>
          
          <div class="button-container">
            ${formData.email ? `<a href="mailto:${formData.email}" class="button button-email" style="color:white;text-decoration:none">Répondre par email</a>` : ''}
            <a href="https://wa.me/${(formData.phone || formData.telephone || '').replace(/[^0-9+]/g, '')}" class="button button-whatsapp" style="color:white;text-decoration:none">Contacter sur WhatsApp</a>
          </div>
          
          <p>Bonne journée,</p>
          
          <div class="signature">
            <p><strong>Votre application de contact</strong></p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} HOUNNOU Déo-Gratias. Tous droits réservés.</p>
          <p>
            <a href="mailto:gratiashounnou@gmail.com">gratiashounnou@gmail.com</a>
            <span style="margin:0 10px">•</span>
            <a href="tel:+22990259815">+229 90 25 98 15</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
