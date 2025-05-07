import { createTablesDirectly } from './server/create-supabase-tables.js';
import { migrateToSupabase } from './server/migrate-to-supabase.js';

async function runMigrationProcess() {
  try {
    console.log('====================================');
    console.log('MIGRATION VERS SUPABASE');
    console.log('====================================');
    
    // Étape 1: Créer les tables dans Supabase
    console.log('\nÉtape 1: Création des tables dans Supabase...');
    const tablesCreated = await createTablesDirectly();
    console.log('------------------------------------');
    
    // Étape 2: Migrer les données vers Supabase
    console.log('\nÉtape 2: Migration des données vers Supabase...');
    const dataMigrated = await migrateToSupabase();
    console.log('------------------------------------');
    
    if (tablesCreated && dataMigrated) {
      console.log('\n✅ MIGRATION RÉUSSIE!');
      console.log('Les tables ont été créées et les données ont été migrées avec succès.');
      console.log('\nProchaine étape: Configurer l\'application pour utiliser Supabase en modifiant le fichier server/storage.ts');
    } else {
      console.log('\n❌ ERREUR: La migration n\'a pas été complétée avec succès.');
      console.log('Vérifiez les erreurs ci-dessus et essayez à nouveau.');
    }
    
    console.log('\n====================================');
  } catch (error) {
    console.error('\n❌ ERREUR GRAVE lors du processus de migration:');
    console.error(error);
  }
}

// Exécuter le processus de migration
runMigrationProcess();