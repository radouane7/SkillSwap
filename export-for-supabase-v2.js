const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Créer une connexion à la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Fonction pour formater la date actuelle (pour le nom de fichier)
function formatDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
}

// Fonction pour échapper les chaînes SQL
function escapeSqlString(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return val.toString();
  if (val instanceof Date) return `'${val.toISOString()}'`;
  
  // Échapper les apostrophes dans les chaînes
  return `'${val.toString().replace(/'/g, "''")}'`;
}

// Fonction pour générer une instruction INSERT pour un enregistrement
function generateInsertStatement(table, row) {
  const columns = Object.keys(row).join(', ');
  const values = Object.values(row).map(escapeSqlString).join(', ');
  
  return `INSERT INTO ${table} (${columns}) VALUES (${values});`;
}

// Fonction principale pour exporter les données
async function exportData() {
  console.log('Démarrage de l\'export des données pour Supabase...');
  
  // Créer le dossier pour les exports s'il n'existe pas
  const exportDir = path.join(process.cwd(), 'supabase-exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  // Définir le chemin du fichier SQL
  const filePath = path.join(exportDir, `supabase-export-v2_${formatDate()}.sql`);
  
  // Ouvrir le fichier en écriture
  const fileStream = fs.createWriteStream(filePath);
  
  // Écrire l'en-tête du fichier SQL
  fileStream.write('-- Export SQL pour Supabase - Schéma exact\n');
  fileStream.write('-- Généré le: ' + new Date().toLocaleString() + '\n');
  fileStream.write('\n');
  fileStream.write('BEGIN;\n\n');
  
  // Tables à exporter (dans l'ordre pour respecter les dépendances)
  const tables = ['users', 'skill_categories', 'skills', 'user_skills', 'exchanges', 'messages', 'reviews', 'notifications'];
  
  // Exporter chaque table
  for (const table of tables) {
    console.log(`Exportation de la table '${table}'...`);
    
    // Récupérer toutes les données de la table
    const query = `SELECT * FROM ${table}`;
    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      fileStream.write(`-- Table: ${table}\n`);
      
      // Générer les INSERT pour chaque ligne
      for (const row of result.rows) {
        fileStream.write(generateInsertStatement(table, row) + '\n');
      }
      
      // Mettre à jour la séquence d'ID si nécessaire
      if (result.rows.length > 0 && result.rows[0].id !== undefined) {
        const maxId = Math.max(...result.rows.map(row => row.id));
        fileStream.write(`SELECT setval('${table}_id_seq', ${maxId}, true);\n`);
      }
      
      fileStream.write('\n');
    }
  }
  
  // Écrire la fin du fichier SQL
  fileStream.write('COMMIT;\n');
  
  // Fermer le fichier
  fileStream.end();
  
  console.log(`Export terminé avec succès! Fichier généré: ${filePath}`);
}

// Exécuter la fonction d'exportation
exportData()
  .catch(err => {
    console.error('Erreur lors de l\'export:', err);
    process.exit(1);
  })
  .finally(() => {
    // Fermer la connexion à la base de données
    pool.end();
  });