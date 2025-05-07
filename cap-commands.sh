#!/bin/bash

# Script pour exécuter des commandes Capacitor

# Commande à exécuter
command=$1

case $command in
  "init")
    npx cap init SkillSwap com.skillswap.app
    ;;
  "add:android")
    npx cap add android
    ;;
  "add:ios")
    npx cap add ios
    ;;
  "sync")
    npx cap sync
    ;;
  "open:android")
    npx cap open android
    ;;
  "open:ios")
    npx cap open ios
    ;;
  "build:android")
    npm run build
    npx cap sync android
    ;;
  "build:ios")
    npm run build
    npx cap sync ios
    ;;
  *)
    echo "Commande non reconnue. Utilisez l'une des suivantes :"
    echo "  init - Initialiser Capacitor"
    echo "  add:android - Ajouter la plateforme Android"
    echo "  add:ios - Ajouter la plateforme iOS"
    echo "  sync - Synchroniser les ressources web"
    echo "  open:android - Ouvrir le projet dans Android Studio"
    echo "  open:ios - Ouvrir le projet dans Xcode"
    echo "  build:android - Construire l'application pour Android"
    echo "  build:ios - Construire l'application pour iOS"
    ;;
esac