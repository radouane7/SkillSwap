// Script pour exécuter la migration vers Supabase
import { config } from 'dotenv';
import { createTablesDirectly } from './server/create-supabase-tables.js';
import { migrateToSupabase } from './server/migrate-to-supabase.js';

config();

async function runMigration() {
  try {
    console.log('Démarrage de la migration vers Supabase...');
    
    // Étape 1: Créer les tables dans Supabase
    console.log('Étape 1: Création des tables dans Supabase');
    await createTablesDirectly();
    
    // Étape 2: Migrer les données de PostgreSQL local vers Supabase
    console.log('Étape 2: Migration des données vers Supabase');
    await migrateToSupabase();
    
    console.log('Migration terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

runMigration();