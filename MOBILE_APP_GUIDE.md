# Guide de création des applications mobiles avec Capacitor

Ce guide explique comment utiliser Capacitor pour convertir l'application web SkillSwap en applications mobiles natives publiables sur Google Play Store et Apple App Store.

## Prérequis

- [Android Studio](https://developer.android.com/studio) pour le développement Android
- [Xcode](https://developer.apple.com/xcode/) pour le développement iOS (uniquement sur macOS)
- [Node.js](https://nodejs.org/) et npm
- [CocoaPods](https://cocoapods.org/) pour iOS

## Préparation

Nous avons déjà installé les packages Capacitor nécessaires :
- @capacitor/core - Bibliothèque principale de Capacitor
- @capacitor/cli - Interface en ligne de commande pour Capacitor
- @capacitor/android - Support Android
- @capacitor/ios - Support iOS

## Configuration

Le fichier `capacitor.config.ts` est déjà configuré avec les paramètres suivants :
```typescript
{
  appId: 'com.skillswap.app',
  appName: 'SkillSwap',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}
```

## Commandes principales

Nous avons créé un script `cap-commands.sh` pour faciliter l'utilisation de Capacitor. Voici les commandes disponibles :

### Initialisation
```bash
./cap-commands.sh init
```
Cette commande initialise Capacitor dans votre projet.

### Ajout de plateformes
```bash
./cap-commands.sh add:android  # Ajouter la plateforme Android
./cap-commands.sh add:ios      # Ajouter la plateforme iOS
```

### Synchronisation du code
Après avoir construit l'application avec `npm run build`, vous devez synchroniser les fichiers avec les projets natifs :
```bash
./cap-commands.sh sync
```

### Ouverture dans IDE natif
```bash
./cap-commands.sh open:android  # Ouvrir dans Android Studio
./cap-commands.sh open:ios      # Ouvrir dans Xcode
```

### Construction pour les plateformes
```bash
./cap-commands.sh build:android  # Construire pour Android
./cap-commands.sh build:ios      # Construire pour iOS
```

## Processus de publication

### Android
1. Exécutez `./cap-commands.sh build:android`
2. Ouvrez le projet dans Android Studio avec `./cap-commands.sh open:android`
3. Dans Android Studio, allez dans Build > Generate Signed Bundle / APK
4. Suivez les instructions pour créer un bundle Android App Bundle (AAB)
5. Publiez le bundle AAB sur Google Play Console

### iOS
1. Exécutez `./cap-commands.sh build:ios`
2. Ouvrez le projet dans Xcode avec `./cap-commands.sh open:ios`
3. Dans Xcode, configurez les certificats de signature et l'identifiant d'équipe
4. Sélectionnez Product > Archive
5. Utilisez l'outil de validation et de distribution d'archives pour soumettre à l'App Store

## Ressources utiles

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Guide de publication Android](https://developer.android.com/studio/publish)
- [Guide de publication iOS](https://developer.apple.com/ios/submit/)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)

## Notes spécifiques à notre projet

- L'intégration de Jitsi Meet est déjà configurée pour fonctionner sur mobile
- Le responsive design est déjà implémenté pour une expérience optimale sur les appareils mobiles
- Pour les notifications push, il faudra ajouter le plugin Capacitor Push Notifications