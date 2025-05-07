// Script pour réinitialiser la base de données et insérer les données d'échantillon
import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { seedDatabase } from './seed-data';
import { DatabaseStorage } from './storage';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function resetDatabase() {
  console.log("Début de la réinitialisation de la base de données...");
  
  // Connecter à la base de données
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Supprimer toutes les tables existantes
    await pool.query(`
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS exchanges CASCADE;
      DROP TABLE IF EXISTS user_skills CASCADE;
      DROP TABLE IF EXISTS skills CASCADE;
      DROP TABLE IF EXISTS skill_categories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS session CASCADE;
    `);
    
    console.log("Tables supprimées avec succès.");
    
    // Exécuter la commande drizzle-kit push pour créer le schéma
    console.log("Création du schéma de la base de données...");
    const { stdout, stderr } = await execPromise('npx drizzle-kit push');
    
    if (stderr) {
      console.error("Erreur lors de la création du schéma:", stderr);
    } else {
      console.log("Schéma créé avec succès:", stdout);
    }
    
    // Créer la table de session
    console.log("Création de la table de session...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    console.log("Table de session créée avec succès.");
    
    // Créer un nouvel objet storage avec une connexion fraîche
    const storage = new DatabaseStorage();
    
    // Insérer les données d'échantillon
    console.log("Insertion des données d'échantillon...");
    await seedDatabase(storage);
    
    console.log("Réinitialisation de la base de données terminée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la réinitialisation de la base de données:", error);
  } finally {
    await pool.end();
  }
}

// Exécuter la fonction
resetDatabase().catch(console.error);