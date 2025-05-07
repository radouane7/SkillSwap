import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { config } from 'dotenv';

// Configurer dotenv
config();

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.DATABASE_URL || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erreur: Les variables d\'environnement nécessaires ne sont pas définies.');
  console.error('Assurez-vous que DATABASE_URL, SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis.');
  process.exit(1);
}

// Connexion à la base de données PostgreSQL locale
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Connexion à Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fonction pour convertir les dates en chaînes ISO
function formatData(rows) {
  return rows.map(row => {
    const newRow = { ...row };
    
    // Convertir les dates en format ISO
    Object.keys(newRow).forEach(key => {
      if (newRow[key] instanceof Date) {
        newRow[key] = newRow[key].toISOString();
      }
    });
    
    return newRow;
  });
}

// Fonction pour migrer les données d'une table
async function migrateTable(tableName, batchSize = 50) {
  console.log(`Migration de la table ${tableName}...`);
  
  try {
    // Vérifier si la table existe dans Supabase
    const { data: testData, error: testError } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (testError && testError.code !== 'PGRST116') {
      console.error(`❌ Erreur lors de l'accès à la table ${tableName} dans Supabase:`, testError);
      return false;
    }
    
    // Récupérer les données de la table locale
    const { rows } = await pool.query(`SELECT * FROM ${tableName}`);
    
    if (rows.length === 0) {
      console.log(`➔ La table ${tableName} est vide, aucune donnée à migrer.`);
      return true;
    }
    
    console.log(`Migrating ${rows.length} rows from ${tableName}`);
    
    // Formatter les données (notamment les dates)
    const formattedData = formatData(rows);
    
    // Migrer par lots pour éviter les problèmes de taille de requête
    let success = true;
    for (let i = 0; i < formattedData.length; i += batchSize) {
      const batch = formattedData.slice(i, i + batchSize);
      
      // Insérer les données dans Supabase avec upsert
      const { error } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Erreur lors de la migration du lot ${i / batchSize + 1} pour ${tableName}:`, error);
        success = false;
        // Continuer malgré l'erreur pour essayer de migrer le plus de données possible
      } else {
        console.log(`✓ Lot ${i / batchSize + 1}/${Math.ceil(formattedData.length / batchSize)} migré avec succès pour ${tableName}`);
      }
    }
    
    if (success) {
      console.log(`✓ Migration de ${rows.length} enregistrements de la table ${tableName} réussie.`);
    } else {
      console.warn(`⚠️ Migration partielle de la table ${tableName}.`);
    }
    
    return success;
  } catch (error) {
    console.error(`❌ Exception lors de la migration de la table ${tableName}:`, error);
    return false;
  }
}

// Fonction principale pour migrer les données
async function migrateToSupabase() {
  try {
    console.log('Migration des données de PostgreSQL vers Supabase...');
    
    // Ordre de migration pour respecter les dépendances
    const tables = [
      'users',
      'skill_categories',
      'skills',
      'user_skills',
      'exchanges',
      'messages',
      'reviews',
      'notifications'
    ];
    
    // Résultats de migration par table
    const results = {};
    
    // Migrer chaque table dans l'ordre
    for (const table of tables) {
      results[table] = await migrateTable(table);
    }
    
    // Afficher un résumé
    console.log('\nRésumé de la migration:');
    for (const [table, success] of Object.entries(results)) {
      console.log(`${success ? '✓' : '❌'} ${table}`);
    }
    
    const allSuccess = Object.values(results).every(result => result);
    if (allSuccess) {
      console.log('\n✅ Migration des données vers Supabase terminée avec succès!');
    } else {
      console.warn('\n⚠️ Migration partielle vers Supabase.');
    }
    
    return allSuccess;
  } catch (error) {
    console.error('❌ Erreur générale lors de la migration vers Supabase:', error);
    return false;
  } finally {
    // Fermer la connexion à la base de données locale
    await pool.end();
  }
}

// Exécuter la fonction de migration
migrateToSupabase()
  .then(success => {
    console.log('Script de migration terminé.');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erreur lors de l\'exécution du script de migration:', error);
    process.exit(1);
  });