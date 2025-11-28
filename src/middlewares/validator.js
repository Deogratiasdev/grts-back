const validateContact = (value) => {
  const { name, email, phone, subject, message, useWhatsApp } = value;
  const errors = [];
  
  // Validation du nom complet
  if (!name || name.trim() === '') {
    errors.push('Le nom complet est requis');
  } else if (name.length > 100) {
    errors.push('Le nom complet ne doit pas dépasser 100 caractères');
  }
  
  // Validation de l'email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Veuillez fournir une adresse email valide');
  }
  
  // Validation du téléphone (obligatoire)
  if (!phone || phone.trim() === '') {
    errors.push('Le numéro de téléphone est obligatoire');
  } else if (!/^[0-9+\s-]{10,20}$/.test(phone)) {
    errors.push('Le numéro de téléphone est invalide. Format attendu : +33 6 12 34 56 78');
  }
  
  // Validation de l'objet
  if (!subject || subject.trim() === '') {
    errors.push('L\'objet est requis');
  } else if (subject.length > 200) {
    errors.push('L\'objet ne doit pas dépasser 200 caractères');
  }
  
  // Validation du message (optionnel)
  if (message && message.trim() !== '') {
    if (message.length > 1000) {
      errors.push('Le message ne doit pas dépasser 1000 caractères');
    } else if (message.length < 10) {
      errors.push('Le message doit contenir au moins 10 caractères s\'il est fourni');
    }
  }
  
  // Vérification du type de useWhatsApp
  if (useWhatsApp !== undefined && typeof useWhatsApp !== 'boolean') {
    errors.push('Le champ WhatsApp doit être un booléen');
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  // Séparation du nom complet en prénom et nom
  const nameParts = name.trim().split(' ');
  const prenom = nameParts[0] || '';
  const nom = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  return { 
    success: true, 
    data: { 
      prenom,
      nom,
      email: email.trim(),
      telephone: phone ? phone.trim() : null,
      projet: `[${subject}] ${message}`,
      whatsapp: !!useWhatsApp
    } 
  };
};

export const contactValidator = async (c, next) => {
  try {
    const body = await c.req.json();
    const validation = validateContact(body);
    
    if (!validation.success) {
      return c.json({ errors: validation.errors }, 400);
    }
    
    c.req.valid = validation.data;
    await next();
  } catch (e) {
    console.error('Erreur de validation:', e);
    return c.json({ error: 'Données invalides' }, 400);
  }
};
