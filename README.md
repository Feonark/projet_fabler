# Fabler

Fabler est une plateforme de **roleplay textuel en temps réel**. Les utilisateurs peuvent rechercher, créer ou rejoindre des **histoires**, gérer leurs **personnages**, et roleplay avec d'autres membres via le **chat en temps réel** associé à chaque histoire.

C'est un projet fullstack personnel, je l'ai réalisé seul de sa conception au déploiement sur une période de 2 mois. Il a été extrêmement formateur et enrichissant, notamment vis-à-vis de la démarche DevOps.

---

## Fonctionnalités principales

- Gestion des **utilisateurs (connexion, inscription, modification des informations personnelles, profil)**
- Création et participation à des **histoires avec système de membres**
- Gestion des **personnages de l'utilisateur**
- **Chats** **en temps réel** pour chaque histoire avec alias personnage (avec status des membres en ligne / en train d'écrire)
- Recherche **live et filtrée** des histoires publiques de la communauté

---

## Architecture

- **Backend :** Symfony + API Platform (API REST)
- **Frontend :** React
- **Base de données :** PostgreSQL
- **Temps réel :** Mercure
- **Reverse proxy** : Traefik
- **Serveur PHP :** Caddy
- **Containerisation :** Docker
- **Tests d'API :** Postman

### Principales entités

- **User** : `id`, `username`, `email`, `avatarUrl`, `characters`, `authoredStories`, `storyMemberships`
- **Story** : `id`, `hashId`, `title`, `description`, `isPublic`, `genreType`, `author`, `members`, `places`, `characters`, `chat`
- **Character** : `id`, `hashId`, `name`, `bio`, `portraitUrl`, `avatarUrl`, `owner`, `usedInStories`, `usedInMessages`
- **Chat** : `id`, `members`, `messages`, `story`, `currentPlace`
- **Message** : `id`, `content`, `createdAt`, `author`, `characterAlias`, `chat`
- **Place** : `id`, `hashId`, `title`, `description`, `placeImageUrl`, `story`, `chat`
- **StoryMember** : `id`, `memberUser`, `story`, `chat`, `messages`, `isAccepted`, `isAuthor`
- **MemberChatStatus** : `id`, `isOnline`, `isWriting`

### Branches

- **main :** Branche stable et mise en ligne
- **ci :** Branche de tests
- **dev :** Branche de développement
