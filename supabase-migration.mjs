// Script simplifié pour créer les tables dans Supabase et migrer les données
import { Pool } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import ws from 'ws';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Connexion à Supabase avec la clé de service pour les opérations admin
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fonction pour créer les tables nécessaires dans Supabase
async function createTables() {
  try {
    console.log('Création des tables dans Supabase...');

    // Créer les tables dans l'ordre correct pour respecter les dépendances
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            firstName TEXT,
            lastName TEXT,
            bio TEXT,
            location TEXT,
            country TEXT,
            city TEXT,
            profileImage TEXT,
            verified BOOLEAN DEFAULT FALSE,
            rating FLOAT DEFAULT 0,
            reviewCount INTEGER DEFAULT 0,
            subscriptionStatus TEXT DEFAULT 'free',
            stripeCustomerId TEXT,
            stripeSubscriptionId TEXT,
            subscriptionExpiresAt TIMESTAMP,
            monthlyProposalCount INTEGER DEFAULT 0,
            lastProposalReset TIMESTAMP,
            createdAt TIMESTAMP DEFAULT NOW(),
            firebaseUid TEXT,
            provider TEXT
          )
        `
      },
      {
        name: 'skill_categories',
        sql: `
          CREATE TABLE IF NOT EXISTS skill_categories (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT,
            colorClass TEXT
          )
        `
      },
      {
        name: 'skills',
        sql: `
          CREATE TABLE IF NOT EXISTS skills (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            categoryId INTEGER NOT NULL REFERENCES skill_categories(id),
            description TEXT
          )
        `
      },
      {
        name: 'user_skills',
        sql: `
          CREATE TABLE IF NOT EXISTS user_skills (
            id SERIAL PRIMARY KEY,
            userId INTEGER NOT NULL REFERENCES users(id),
            skillId INTEGER NOT NULL REFERENCES skills(id),
            isOffered BOOLEAN NOT NULL,
            experienceLevel TEXT NOT NULL,
            description TEXT
          )
        `
      },
      {
        name: 'exchanges',
        sql: `
          CREATE TABLE IF NOT EXISTS exchanges (
            id SERIAL PRIMARY KEY,
            requestorId INTEGER NOT NULL REFERENCES users(id),
            providerId INTEGER NOT NULL REFERENCES users(id),
            requestorSkillId INTEGER NOT NULL REFERENCES skills(id),
            providerSkillId INTEGER NOT NULL REFERENCES skills(id),
            status TEXT NOT NULL,
            exchangeMethod TEXT,
            location TEXT,
            videoLink TEXT,
            requestorConfirmed BOOLEAN,
            providerConfirmed BOOLEAN,
            scheduledDate TIMESTAMP,
            createdAt TIMESTAMP DEFAULT NOW()
          )
        `
      },
      {
        name: 'messages',
        sql: `
          CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            senderId INTEGER NOT NULL REFERENCES users(id),
            receiverId INTEGER NOT NULL REFERENCES users(id),
            content TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            createdAt TIMESTAMP DEFAULT NOW()
          )
        `
      },
      {
        name: 'reviews',
        sql: `
          CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            exchangeId INTEGER NOT NULL REFERENCES exchanges(id),
            reviewerId INTEGER NOT NULL REFERENCES users(id),
            revieweeId INTEGER NOT NULL REFERENCES users(id),
            rating INTEGER NOT NULL,
            comment TEXT,
            createdAt TIMESTAMP DEFAULT NOW()
          )
        `
      },
      {
        name: 'notifications',
        sql: `
          CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            userId INTEGER NOT NULL REFERENCES users(id),
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            linkUrl TEXT,
            relatedUserId INTEGER REFERENCES users(id),
            relatedItemId INTEGER,
            createdAt TIMESTAMP DEFAULT NOW()
          )
        `
      }
    ];

    for (const table of tables) {
      try {
        console.log(`Création de la table ${table.name}...`);
        const { error } = await supabase.rpc('execute_sql', { sql: table.sql });
        
        if (error) {
          if (error.message && error.message.includes('already exists')) {
            console.log(`✓ La table ${table.name} existe déjà.`);
          } else {
            console.error(`✗ Erreur lors de la création de la table ${table.name}:`, error);
          }
        } else {
          console.log(`✓ Table ${table.name} créée avec succès.`);
        }
      } catch (tableError) {
        console.error(`✗ Exception lors de la création de la table ${table.name}:`, tableError);
      }
    }

    console.log('✓ Création des tables terminée.');
    return true;
  } catch (error) {
    console.error('✗ Erreur générale lors de la création des tables:', error);
    return false;
  }
}

// Fonction pour migrer les données
async function migrateData() {
  try {
    console.log('Migration des données vers Supabase...');

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

    for (const table of tables) {
      try {
        console.log(`Migration de la table ${table}...`);
        
        // Récupérer les données de la table locale
        const result = await pool.query(`SELECT * FROM ${table}`);
        const data = result.rows;
        
        if (data.length === 0) {
          console.log(`➔ La table ${table} est vide, aucune donnée à migrer.`);
          continue;
        }
        
        // Formatter les dates pour Supabase si nécessaire
        const formattedData = data.map(row => {
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
          .from(table)
          .upsert(formattedData, { onConflict: 'id' });
        
        if (error) {
          console.error(`✗ Erreur lors de la migration de la table ${table}:`, error);
        } else {
          console.log(`✓ Migration de ${data.length} enregistrements de la table ${table} réussie.`);
        }
      } catch (tableError) {
        console.error(`✗ Exception lors de la migration de la table ${table}:`, tableError);
      }
    }

    console.log('✓ Migration des données terminée.');
    return true;
  } catch (error) {
    console.error('✗ Erreur générale lors de la migration des données:', error);
    return false;
  } finally {
    // Fermer la connexion à la base de données locale
    await pool.end();
  }
}

// Fonction principale
async function main() {
  try {
    console.log('Début du processus de migration vers Supabase...');
    
    // Étape 1: Créer les tables dans Supabase
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      console.error('✗ Échec de la création des tables, arrêt de la migration.');
      process.exit(1);
    }
    
    // Étape 2: Migrer les données vers Supabase
    const dataMigrated = await migrateData();
    if (!dataMigrated) {
      console.error('✗ Échec de la migration des données.');
      process.exit(1);
    }
    
    console.log('✅ Migration vers Supabase terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('✗ Erreur lors du processus de migration:', error);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();