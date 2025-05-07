# Migration vers Supabase

Ce document décrit le processus de migration de la base de données locale vers Supabase.

## Étapes complétées

1. **Création des tables dans Supabase**
   - Exécution du script SQL pour créer toutes les tables nécessaires
   - Les tables suivent la convention de nommage snake_case (standard Supabase)

2. **Migration des données**
   - Exportation des données depuis la base de données locale
   - Importation des données dans Supabase

3. **Adaptation de l'interface IStorage**
   - Implémentation de l'adaptateur `SupabaseStorage` dans `server/supabase-storage.ts`
   - Conversion entre formats snake_case (Supabase) et camelCase (application)

4. **Conversion des noms de champs**
   - Implémentation des conversions pour toutes les méthodes critiques :
     - Gestion des utilisateurs
     - Gestion des compétences
     - Gestion des échanges
     - Gestion des messages
     - Gestion des notifications

5. **Création des fonctions SQL personnalisées**
   - Fonction `find_matches` pour trouver les utilisateurs compatibles

## Pourquoi une conversion de format est nécessaire

Supabase utilise le format snake_case pour les noms de champs dans la base de données (c'est le standard PostgreSQL), tandis que notre application utilise le format camelCase pour les objets JavaScript. Cette différence nécessite une conversion dans les deux sens :

- **Format Supabase → Application** : conversion snake_case vers camelCase
  - Exemple : `first_name` → `firstName`
  - Effectuée lors de la récupération des données

- **Format Application → Supabase** : conversion camelCase vers snake_case
  - Exemple : `firstName` → `first_name`
  - Effectuée lors de l'insertion ou la mise à jour des données

## Structure de l'adaptateur Supabase

L'adaptateur Supabase est implémenté dans la classe `SupabaseStorage` qui se conforme à l'interface `IStorage` définie dans `server/storage.ts`. Cette classe utilise le client Supabase pour communiquer avec la base de données et effectue les conversions nécessaires.

## Comment ajouter une nouvelle fonction

Pour ajouter une nouvelle fonction à l'adaptateur Supabase :

1. Ajoutez la fonction à l'interface `IStorage` dans `server/storage.ts`
2. Implémentez la fonction dans la classe `SupabaseStorage` dans `server/supabase-storage.ts`
3. N'oubliez pas d'effectuer les conversions de format nécessaires

## Fonctions SQL personnalisées

Les fonctions SQL personnalisées sont définies dans le fichier `create-supabase-function.sql`. Pour ajouter ces fonctions à votre base de données Supabase :

1. Connectez-vous à votre projet Supabase
2. Allez dans la section "SQL Editor"
3. Créez une nouvelle requête
4. Copiez et collez le contenu du fichier SQL
5. Exécutez la requête