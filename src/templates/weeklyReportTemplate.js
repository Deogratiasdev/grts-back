// Configuration du template du rapport hebdomadaire
const weeklyReportConfig = {
  subject: 'Rapport Hebdomadaire des Nouveaux Clients',
  intro: 'Voici le récapitulif des nouveaux clients de la semaine.',
  closing: 'Bonne continuation et excellente semaine !',
  
  // Styles pour l'email
  styles: {
    container: 'font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;',
    header: 'background-color: #4a6fa5; color: white; padding: 20px; text-align: center;',
    content: 'padding: 20px;',
    footer: 'background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px;',
    table: 'width: 100%; border-collapse: collapse; margin: 15px 0;',
    th: 'background-color: #f4f4f4; padding: 10px; text-align: left; border: 1px solid #ddd;',
    td: 'padding: 10px; border: 1px solid #ddd;',
    highlight: 'background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;',
    button: 'display: inline-block; padding: 10px 20px; background-color: #4a6fa5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;',
    signature: 'margin-top: 20px; font-style: italic;'
  }
};

/**
 * Génère le contenu HTML du rapport hebdomadaire
 * @param {Array} clients - Liste des clients de la semaine
 * @returns {Object} Objet contenant le sujet et le contenu HTML de l'email
 */
function generateWeeklyReportEmail(clients) {
  const { styles } = weeklyReportConfig;
  const totalClients = clients.length;
  const weekNumber = getWeekNumber(new Date());
  
  // En-tête du tableau
  let tableContent = `
    <tr>
      <th style="${styles.th}">Nom</th>
      <th style="${styles.th}">Email</th>
      <th style="${styles.th}">Téléphone</th>
      <th style="${styles.th}">Date</th>
      <th style="${styles.th}">Projet</th>
    </tr>
  `;

  // Lignes du tableau
  clients.forEach(client => {
    tableContent += `
      <tr>
        <td style="${styles.td}">${client.prenom} ${client.nom}</td>
        <td style="${styles.td}">${client.email}</td>
        <td style="${styles.td}">${client.telephone || 'Non renseigné'}</td>
        <td style="${styles.td}">${formatDate(client.created_at)}</td>
        <td style="${styles.td}">${client.projet}</td>
      </tr>
    `;
  });

  // Construction du contenu HTML complet
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${weeklyReportConfig.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <div style="${styles.container}">
        <!-- En-tête -->
        <div style="${styles.header}">
          <h1>Rapport Hebdomadaire</h1>
          <p>Semaine ${weekNumber} - ${new Date().getFullYear()}</p>
        </div>
        
        <!-- Contenu principal -->
        <div style="${styles.content}">
          <p>Bonjour,</p>
          <p>${weeklyReportConfig.intro}</p>
          
          <div style="${styles.highlight}">
            <h3>Résumé de la semaine</h3>
            <p>Nombre total de nouveaux clients : <strong>${totalClients}</strong></p>
          </div>
          
          <h3>Détail des nouveaux clients</h3>
          ${totalClients > 0 ? 
            `<table style="${styles.table}" border="0" cellpadding="0" cellspacing="0">
              <thead>${tableContent.split('</tr>')[0]}</tr></thead>
              <tbody>${tableContent.split('</tr>').slice(1).join('</tr>')}</tbody>
            </table>` 
            : 
            '<p>Aucun nouveau client cette semaine.</p>'
          }
          
          <p>${weeklyReportConfig.closing}</p>
          
          <div style="${styles.signature}">
            <p>Cordialement,<br>L'équipe de gestion des clients</p>
          </div>
        </div>
        
        <!-- Pied de page -->
        <div style="${styles.footer}">
          <p>© ${new Date().getFullYear()} Votre Entreprise. Tous droits réservés.</p>
          <p>Si vous ne souhaitez plus recevoir ces rapports, veuillez mettre à jour vos préférences.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `${weeklyReportConfig.subject} - Semaine ${weekNumber}`,
    html: htmlContent
  };
}

/**
 * Formate une date au format JJ/MM/AAAA
 * @param {string} dateString - Date au format ISO
 * @returns {string} Date formatée
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Retourne le numéro de la semaine dans l'année
 * @param {Date} date - Date
 * @returns {number} Numéro de la semaine
 */
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

export default generateWeeklyReportEmail;
