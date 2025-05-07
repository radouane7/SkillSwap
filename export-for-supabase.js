import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Configurer dotenv
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vérifier que la variable d'environnement DATABASE_URL est définie
if (!process.env.DATABASE_URL) {
  console.error(
    "Erreur: La variable d'environnement DATABASE_URL n'est pas définie.",
  );
  process.exit(1);
}

// Connexion à la base de données PostgreSQL locale
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Formater la date pour utilisation dans les noms de fichiers
function formatDate() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}_${now.getHours().toString().padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}`;
}

// Créer le répertoire pour les exports s'il n'existe pas
const exportDir = path.join(__dirname, "supabase-exports");
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

// Nom du fichier d'export
const exportFile = path.join(exportDir, `supabase-export_${formatDate()}.sql`);

// Tables à exporter (dans l'ordre pour respecter les dépendances)
const tables = [
  "users",
  "skill_categories",
  "skills",
  "user_skills",
  "exchanges",
  "messages",
  "reviews",
  "notifications",
];

// Fonction pour échapper les valeurs texte pour SQL
function escapeSqlString(val) {
  if (val === null) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return val;
  if (val instanceof Date) return `'${val.toISOString()}'`;

  // Échapper les apostrophes en les doublant (standard SQL)
  return `'${val.toString().replace(/'/g, "''")}'`;
}

// Fonction pour générer une commande INSERT pour une ligne
function generateInsertStatement(table, row) {
  const columns = Object.keys(row).join(", ");
  const values = Object.values(row)
    .map((val) => escapeSqlString(val))
    .join(", ");
  return `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
}

// Fonction principale pour exporter les données
async function exportData() {
  console.log("Démarrage de l'export des données pour Supabase...");

  try {
    // Initier le fichier SQL avec une transaction
    fs.writeFileSync(
      exportFile,
      `-- Export SQL pour Supabase généré le ${new Date().toISOString()}\n`,
    );
    fs.appendFileSync(
      exportFile,
      `-- À exécuter dans la console SQL de Supabase\n\n`,
    );
    fs.appendFileSync(exportFile, `BEGIN;\n\n`);

    // Pour chaque table, exporter les données
    for (const table of tables) {
      console.log(`Exportation de la table '${table}'...`);
      fs.appendFileSync(exportFile, `-- Table: ${table}\n`);

      const { rows: tableData } = await pool.query(`SELECT * FROM ${table}`);

      if (tableData.length === 0) {
        fs.appendFileSync(
          exportFile,
          `-- Aucune donnée dans la table '${table}'\n\n`,
        );
        continue;
      }

      // Générer les commandes INSERT
      tableData.forEach((row) => {
        const insertStatement = generateInsertStatement(table, row);
        fs.appendFileSync(exportFile, insertStatement);
      });

      // Ajouter une ligne vide pour la lisibilité
      fs.appendFileSync(exportFile, `\n`);

      // Mettre à jour la séquence pour que les prochaines insertions commencent au bon ID
      const { rows: maxIdResult } = await pool.query(
        `SELECT MAX(id) as max_id FROM ${table}`,
      );
      const maxId = maxIdResult[0].max_id;

      if (maxId) {
        fs.appendFileSync(
          exportFile,
          `-- Mise à jour de la séquence pour '${table}'\n`,
        );
        fs.appendFileSync(
          exportFile,
          `SELECT setval('${table}_id_seq', ${maxId}, true);\n\n`,
        );
      }
    }

    // Finir la transaction
    fs.appendFileSync(exportFile, `COMMIT;\n`);

    console.log(`Export terminé avec succès! Fichier généré: ${exportFile}`);
  } catch (error) {
    console.error("Erreur lors de l'export des données:", error);

    // En cas d'erreur, ajouter un ROLLBACK
    fs.appendFileSync(
      exportFile,
      `\n-- Erreur lors de l'export: ${error.message}\n`,
    );
    fs.appendFileSync(exportFile, `ROLLBACK;\n`);
  } finally {
    // Fermer la connexion à la base de données
    await pool.end();
  }
}

// Exécuter la fonction d'export
exportData();
