import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Configurer dotenv
config();

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erreur: Les variables d\'environnement SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY ne sont pas définies.');
  process.exit(1);
}

// Connexion à Supabase avec la clé de service pour les opérations admin
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Tableaux de création de tables SQL
const createTablesSql = [
  // Utilisateurs
  `CREATE TABLE IF NOT EXISTS users (
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
  )`,
  
  // Catégories de compétences
  `CREATE TABLE IF NOT EXISTS skill_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    colorClass TEXT
  )`,
  
  // Compétences
  `CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    categoryId INTEGER NOT NULL REFERENCES skill_categories(id),
    description TEXT
  )`,
  
  // Compétences des utilisateurs
  `CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id),
    skillId INTEGER NOT NULL REFERENCES skills(id),
    isOffered BOOLEAN NOT NULL,
    experienceLevel TEXT NOT NULL,
    description TEXT
  )`,
  
  // Échanges
  `CREATE TABLE IF NOT EXISTS exchanges (
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
  )`,
  
  // Messages
  `CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    senderId INTEGER NOT NULL REFERENCES users(id),
    receiverId INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT NOW()
  )`,
  
  // Avis
  `CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    exchangeId INTEGER NOT NULL REFERENCES exchanges(id),
    reviewerId INTEGER NOT NULL REFERENCES users(id),
    revieweeId INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    createdAt TIMESTAMP DEFAULT NOW()
  )`,
  
  // Notifications
  `CREATE TABLE IF NOT EXISTS notifications (
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
  )`
];

// Fonction pour exécuter une requête SQL sur Supabase
async function executeSql(query) {
  try {
    // Utiliser l'API REST pour exécuter des requêtes personnalisées
    const { data, error } = await supabase.rpc('execute_sql', { query });
    
    if (error) {
      console.error('Erreur SQL:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception lors de l\'exécution SQL:', error);
    return false;
  }
}

// Fonction pour créer les tables directement
async function createTables() {
  console.log('Création des tables SQL dans Supabase via l\'API REST...');
  
  // Créer chaque table
  for (let i = 0; i < createTablesSql.length; i++) {
    console.log(`Création de la table ${i+1}/${createTablesSql.length}...`);
    
    // Exécuter la requête SQL
    const success = await executeSql(createTablesSql[i]);
    
    if (!success) {
      console.error(`Erreur lors de la création de la table ${i+1}`);
    } else {
      console.log(`Table ${i+1} créée avec succès`);
    }
  }
  
  console.log('Création des tables SQL terminée');
  return true;
}

// Fonction alternative pour créer les tables avec l'API SQL
async function createTablesWithSQL() {
  console.log('Tentative d\'utilisation de l\'API SQL...');
  
  try {
    // Utiliser l'API SQL pour exécuter des requêtes personnalisées
    for (let i = 0; i < createTablesSql.length; i++) {
      console.log(`Tentative de création de la table ${i+1}/${createTablesSql.length}...`);
      
      const { error } = await supabase.sql(createTablesSql[i]);
      
      if (error) {
        console.error(`Erreur SQL (${i+1}):`, error);
      } else {
        console.log(`Table ${i+1} créée avec succès`);
      }
    }
    
    console.log('Création des tables SQL terminée');
    return true;
  } catch (error) {
    console.error('Exception lors de l\'utilisation de l\'API SQL:', error);
    console.log('L\'API SQL n\'est peut-être pas disponible dans votre plan Supabase');
    return false;
  }
}

// Fonction pour créer les tables avec un script SQL d'exportation
async function createTablesForExport() {
  console.log('Génération du script SQL pour création manuelle des tables...');
  
  // Générer le script SQL
  let sqlScript = '-- Script de création des tables pour Supabase\n';
  sqlScript += '-- À exécuter manuellement dans la console SQL de Supabase\n\n';
  sqlScript += 'BEGIN;\n\n';
  
  for (let i = 0; i < createTablesSql.length; i++) {
    sqlScript += `-- Table ${i+1}\n`;
    sqlScript += createTablesSql[i] + ';\n\n';
  }
  
  sqlScript += 'COMMIT;\n';
  
  // Afficher le script SQL
  console.log('\nScript SQL pour création manuelle des tables:');
  console.log('=========================================');
  console.log(sqlScript);
  console.log('=========================================');
  
  return sqlScript;
}

// Fonction principale
async function main() {
  try {
    console.log('Démarrage du processus de création des tables dans Supabase...');
    
    // Essayer d'abord de créer les tables avec l'API REST
    const success = await createTables();
    
    if (!success) {
      console.log('\nLa création directe des tables a échoué, tentative avec l\'API SQL...');
      const sqlSuccess = await createTablesWithSQL();
      
      if (!sqlSuccess) {
        console.log('\nLa création des tables avec l\'API SQL a également échoué');
        console.log('Génération d\'un script SQL pour création manuelle...');
        await createTablesForExport();
      }
    }
    
    console.log('\nProcessus terminé.');
  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

// Exécuter la fonction principale
main();