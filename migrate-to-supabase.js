import { Pool } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import ws from 'ws';

// Configurer dotenv
config();

// Configurer Neon pour utiliser websockets
const neonConfig = { webSocketConstructor: ws };

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.DATABASE_URL || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erreur: Les variables d\'environnement nécessaires ne sont pas définies.');
  console.error('Assurez-vous que DATABASE_URL, SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies.');
  process.exit(1);
}

// Connexion à la base de données PostgreSQL locale
const pool = new Pool({ connectionString: process.env.DATABASE_URL, neonConfig });

// Connexion à Supabase avec la clé de service pour les opérations admin
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fonction pour migrer les données d'une table
async function migrateTable(tableName) {
  console.log(`Migration de la table ${tableName}...`);
  
  try {
    // Récupérer les données de la table locale
    const { rows } = await pool.query(`SELECT * FROM ${tableName}`);
    
    if (rows.length === 0) {
      console.log(`➔ La table ${tableName} est vide, aucune donnée à migrer.`);
      return true;
    }
    
    console.log(`Migrating ${rows.length} rows from ${tableName}`);
    
    // Formatter les dates pour Supabase
    const formattedData = rows.map(row => {
      const newRow = { ...row };
      
      // Convertir les dates en format ISO pour Supabase
      Object.keys(newRow).forEach(key => {
        if (newRow[key] instanceof Date) {
          newRow[key] = newRow[key].toISOString();
        }
      });
      
      return newRow;
    });
    
    // Insérer les données dans Supabase avec upsert
    const { error } = await supabase
      .from(tableName)
      .upsert(formattedData, { onConflict: 'id' });
    
    if (error) {
      console.error(`✗ Erreur lors de la migration de la table ${tableName}:`, error);
      return false;
    } else {
      console.log(`✓ Migration de ${rows.length} enregistrements de la table ${tableName} réussie.`);
      return true;
    }
  } catch (error) {
    console.error(`✗ Exception lors de la migration de la table ${tableName}:`, error);
    return false;
  }
}

// Fonction principale pour migrer les données
export async function migrateToSupabase() {
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
    
    // Migrer chaque table dans l'ordre
    for (const table of tables) {
      await migrateTable(table);
    }
    
    console.log('✅ Migration des données vers Supabase terminée avec succès!');
    return true;
  } catch (error) {
    console.error('Erreur générale lors de la migration vers Supabase:', error);
    return false;
  } finally {
    await pool.end();
  }
}

// Exécuter la fonction si le script est appelé directement
if (process.argv[1].includes('migrate-to-supabase.js')) {
  migrateToSupabase().then(() => {
    console.log('Script de migration terminé.');
    process.exit(0);
  }).catch(error => {
    console.error('Erreur lors de l\'exécution du script de migration:', error);
    process.exit(1);
  });
}