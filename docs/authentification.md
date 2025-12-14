# Documentation de l'API d'Authentification

## 1. Envoi du code de vérification

### Requête
```http
POST /api/lifeassistant/auths
Content-Type: application/json

{
  "email": "utilisateur@exemple.com"
}
```

### Réponse en cas de succès (200 OK)
```json
{
  "success": true,
  "message": "Code de vérification envoyé avec succès"
}
```

### Réponse si l'email n'est pas autorisé (403 Forbidden)
```json
{
  "success": false,
  "message": "Accès non autorisé. Veuillez contacter un administrateur."
}
```

## 2. Vérification du code et connexion

### Requête
```http
POST /api/lifeassistant/verify-code
Content-Type: application/json

{
  "email": "utilisateur@exemple.com",
  "code": "123456"
}
```

### Réponse en cas de succès (200 OK)
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "utilisateur@exemple.com",
    "name": "utilisateur",
    "role": "admin"
  }
}
```

### Réponse en cas de code invalide (400 Bad Request)
```json
{
  "success": false,
  "message": "Code invalide ou expiré"
}
```

### Réponse en cas de trop de tentatives (429 Too Many Requests)
```json
{
  "success": false,
  "message": "Trop de tentatives, veuillez réessayer plus tard",
  "retryAfter": 900
}
```

## 3. Vérification de l'état d'authentification

### Requête
```http
GET /api/lifeassistant/check-auth
```

### Réponse si authentifié (200 OK)
```json
{
  "authenticated": true,
  "user": {
    "id": "user123",
    "email": "utilisateur@exemple.com",
    "name": "utilisateur",
    "role": "admin"
  }
}
```

### Réponse si non authentifié (200 OK)
```json
{
  "authenticated": false
}
```

## 4. Déconnexion

### Requête
```http
POST /api/lifeassistant/logout
```

### Réponse en cas de succès (200 OK)
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

## Configuration requise

### Variables d'environnement

Assurez-vous que les variables d'environnement suivantes sont configurées :

- `ADMIN_EMAIL_1` : Email du super administrateur
- `BREVO_API_KEY` : Clé API pour l'envoi d'emails via Brevo
- `BREVO_SENDER_EMAIL` : Email de l'expéditeur
- `BREVO_SENDER_NAME` : Nom de l'expéditeur
- `FRONTEND_URL` : URL du frontend pour les redirections CORS

### Base de données

Les tables suivantes doivent être présentes dans la base de données :

1. `users` : Stocke les informations des utilisateurs
2. `verification_codes` : Stocke les codes de vérification
3. `user_sessions` : Gère les sessions utilisateur
4. `autorisations` : Liste des emails autorisés à se connecter

## Sécurité

- Les mots de passe ne sont pas stockés (utilisation de l'authentification sans mot de passe)
- Les codes de vérification expirent après 15 minutes
- Maximum 5 tentatives avant blocage temporaire
- Les cookies de session sont sécurisés et en httpOnly
- Protection contre les attaques par force brute avec rate limiting
- Validation des entrées utilisateur
- Gestion appropriée des erreurs sans fuite d'informations sensibles
