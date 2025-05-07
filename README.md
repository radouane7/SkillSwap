# SkillSwap - Plateforme de Troc de Compétences

SkillSwap est une plateforme qui permet aux utilisateurs d'échanger leurs compétences sans transaction monétaire. L'objectif est de valoriser le temps et les talents individuels tout en favorisant l'apprentissage collaboratif et la création d'une communauté active.

## Fonctionnalités

- **Profils utilisateur** avec compétences offertes et recherchées
- **Système de matchmaking** basé sur les compétences offertes et recherchées
- **Calendrier intégré** pour planifier les échanges
- **Messagerie** pour communiquer avec les autres utilisateurs
- **Système d'évaluation** pour maintenir la qualité des échanges
- **Modèle Freemium** avec abonnements premium offrant des fonctionnalités supplémentaires

## Technologies utilisées

- **Frontend** : React / TypeScript avec Shadcn/UI + TailwindCSS
- **Backend** : Node.js / Express
- **Base de données** : PostgreSQL avec Drizzle ORM
- **Authentification** : Passport.js
- **Paiements** : Stripe

## Configuration du projet

### Prérequis

- Node.js 18+
- PostgreSQL
- Un compte Stripe pour les fonctionnalités de paiement

### Installation

1. Clonez le dépôt
2. Installez les dépendances : `npm install`
3. Configurez les variables d'environnement (voir ci-dessous)
4. Démarrez l'application : `npm run dev`

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
DATABASE_URL=postgresql://user:password@localhost:5432/skillswap
STRIPE_SECRET_KEY=votre_clé_secrète_stripe
VITE_STRIPE_PUBLIC_KEY=votre_clé_publique_stripe
```

## Réinitialiser la base de données

Pour réinitialiser la base de données et la remplir avec des données d'exemple, exécutez :

```bash
npx tsx server/reset-database.ts
```

Ce script va :
1. Supprimer toutes les tables existantes
2. Recréer le schéma de la base de données
3. Insérer des données d'exemple (catégories de compétences, compétences, utilisateurs, échanges, messages, etc.)

## Architecture du projet

```
/client           # Frontend React
  /src
    /components   # Composants UI réutilisables
    /hooks        # React hooks personnalisés
    /lib          # Utilitaires frontend
    /pages        # Pages de l'application
/server           # Backend Express
  auth.ts         # Configuration de l'authentification
  db.ts           # Configuration de la base de données
  index.ts        # Point d'entrée du serveur
  routes.ts       # Routes API
  storage.ts      # Interface d'accès aux données
  reset-database.ts # Script de réinitialisation de la base de données
  seed-data.ts    # Données d'exemple
/shared           # Code partagé entre frontend et backend
  schema.ts       # Schéma de la base de données (Drizzle)
```

## Comptes de test

L'application est préchargée avec plusieurs comptes utilisateur pour faciliter les tests :

- **Administrateur** : admin@example.com / password123
- **Utilisateur standard** : user@example.com / password123
- **Utilisateur premium** : premium@example.com / password123

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.