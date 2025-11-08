# 🎵 MusicFinder - Application de reconnaissance musicale

Bienvenue dans **MusicFinder**, une application moderne de reconnaissance musicale. Elle permet aux utilisateurs de :

- Identifier des musiques à partir d’un enregistrement audio
- Voir les détails de la chanson : titre, artiste, album, paroles, taux de confiance
- Sauvegarder les recherches dans un historique personnel
- Supprimer des éléments de l’historique
- Gérer les sessions utilisateurs grâce à un système d’authentification

---

## 🌐 Technologies utilisées

### Frontend (React + TypeScript)

- **React** avec **TypeScript**
- **Material-UI (MUI)** pour une interface élégante et responsive
- **Axios** pour la communication HTTP
- **Framer Motion** pour des animations fluides
- **Contexte Auth** (`AuthContext`) pour la gestion de l'utilisateur connecté

### Backend (Flask + SQLAlchemy)

- **Flask** pour créer les routes d’API
- **Flask-CORS** pour autoriser la communication entre le frontend (`localhost:5174`) et le backend (`localhost:8000`)
- **SQLAlchemy** pour la gestion de la base de données PostgreSQL ou SQLite

---

## ⚙️ Fonctionnalités principales

### 🔍 1. Recherche musicale

- L'utilisateur enregistre un extrait audio via le micro
- L'application envoie le fichier `.wav` au backend (ou utilise un mock côté frontend)
- Les résultats affichent :
  - Titre
  - Artiste
  - Paroles (si disponibles)
  - Confiance (%)

### 💾 2. Historique personnalisé

- Chaque utilisateur a un historique privé
- Les chansons identifiées sont sauvegardées dans une table `history` avec :
  - `title`, `paroles`, `user_id`, `date_search`
- Les utilisateurs peuvent :
  - Visualiser leur historique dans un composant `SearchHistory`
  - Supprimer une recherche via une icône `Delete`

### 👤 3. Authentification

- Le système d’auth gère :
  - La session utilisateur (`AuthContext`)
  - L’identifiant `user.id` est utilisé pour lier les historiques

---

## 🧠 Structure des dossiers

