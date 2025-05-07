import { supabaseAdmin } from './supabase';

// Fonction pour créer les tables dans Supabase
async function createSupabaseTables() {
  try {
    console.log('Création des tables dans Supabase...');

    // Création de la table users
    console.log('Création de la table users...');
    const { error: usersError } = await supabaseAdmin.rpc('create_users_table');
    if (usersError) {
      // Si la table existe déjà, ce n'est pas une erreur fatale
      if (usersError.message.includes('already exists')) {
        console.log('La table users existe déjà.');
      } else {
        console.error('Erreur lors de la création de la table users:', usersError);
      }
    } else {
      console.log('Table users créée avec succès.');
    }

    // Création de la table skill_categories
    console.log('Création de la table skill_categories...');
    const { error: categoriesError } = await supabaseAdmin.rpc('create_skill_categories_table');
    if (categoriesError) {
      if (categoriesError.message.includes('already exists')) {
        console.log('La table skill_categories existe déjà.');
      } else {
        console.error('Erreur lors de la création de la table skill_categories:', categoriesError);
      }
    } else {
      console.log('Table skill_categories créée avec succès.');
    }

    // Création de la table skills
    console.log('Création de la table skills...');
    const { error: skillsError } = await supabaseAdmin.rpc('create_skills_table');
    if (skillsError) {
      if (skillsError.message.includes('already exists')) {
        console.log('La table skills existe déjà.');
      } else {
        console.error('Erreur lors de la création de la table skills:', skillsError);
      }
    } else {
      console.log('Table skills créée avec succès.');
    }

    // Création de la table user_skills
    console.log('Création de la table user_skills...');
    const { error: userSkillsError } = await supabaseAdmin.rpc('create_user_skills_table');
    if (userSkillsError) {
      if (userSkillsError.message.includes('already exists')) {
        console.log('La table user_skills existe déjà.');
      } else {
        console.error('Erreur lors de la création de la table user_skills:', userSkillsError);
      }
    } else {
      console.log('Table user_skills créée avec succès.');
    }

    // Création de la table exchanges
    console.log('Création de la table exchanges...');
    const { error: exchangesError } = await supabaseAdmin.rpc('create_exchanges_table');
    if (exchangesError) {
      if (exchangesError.message.includes('already exists')) {
        console.log('La table exchanges existe déjà.');
      } else {
        console.error('Erreur lors de la création de la table exchanges:', exchangesError);
      }
    } else {
      console.log('Table exchanges créée avec succès.');
    }

    // Création de la table messages
    console.log('Création de la table messages...');
    const { error: messagesError } = await supabaseAdmin.rpc('create_messages_table');
    if (messagesError) {
      if (messagesError.message.includes('already exists')) {
        console.log('La table messages existe déjà.');
      } else {
        console.error('Erreur lors de la création de la table messages:', messagesError);
      }
    } else {
      console.log('Table messages créée avec succès.');
    }

    // Création de la table reviews
    console.log('Création de la table reviews...');
    const { error: reviewsError } = await supabaseAdmin.rpc('create_reviews_table');
    if (reviewsError) {
      if (reviewsError.message.includes('already exists')) {
        console.log('La table reviews existe déjà.');
      } else {
        console.error('Erreur lors de la création de la table reviews:', reviewsError);
      }
    } else {
      console.log('Table reviews créée avec succès.');
    }

    // Création de la table notifications
    console.log('Création de la table notifications...');
    const { error: notificationsError } = await supabaseAdmin.rpc('create_notifications_table');
    if (notificationsError) {
      if (notificationsError.message.includes('already exists')) {
        console.log('La table notifications existe déjà.');
      } else {
        console.error('Erreur lors de la création de la table notifications:', notificationsError);
      }
    } else {
      console.log('Table notifications créée avec succès.');
    }

    console.log('Toutes les tables ont été créées avec succès dans Supabase.');
  } catch (error) {
    console.error('Erreur lors de la création des tables dans Supabase:', error);
  }
}

// Création de procédures SQL pour créer chaque table
async function createSqlFunctions() {
  try {
    console.log('Création des procédures SQL pour les tables...');

    // Fonction pour créer la table users
    await supabaseAdmin.rpc('create_function_for_users_table');

    // Fonction pour créer la table skill_categories
    await supabaseAdmin.rpc('create_function_for_skill_categories_table');

    // Fonction pour créer la table skills
    await supabaseAdmin.rpc('create_function_for_skills_table');

    // Fonction pour créer la table user_skills
    await supabaseAdmin.rpc('create_function_for_user_skills_table');

    // Fonction pour créer la table exchanges
    await supabaseAdmin.rpc('create_function_for_exchanges_table');

    // Fonction pour créer la table messages
    await supabaseAdmin.rpc('create_function_for_messages_table');

    // Fonction pour créer la table reviews
    await supabaseAdmin.rpc('create_function_for_reviews_table');

    // Fonction pour créer la table notifications
    await supabaseAdmin.rpc('create_function_for_notifications_table');

    console.log('Toutes les procédures SQL ont été créées avec succès.');
  } catch (error) {
    console.error('Erreur lors de la création des procédures SQL:', error);
  }
}

// Créer les tables directement avec des requêtes SQL
async function createTablesDirectly() {
  try {
    console.log('Création directe des tables dans Supabase...');

    // Création de la table users
    console.log('Création de la table users...');
    const { error: usersError } = await supabaseAdmin.rpc('execute_sql', {
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
        );
      `
    });
    
    if (usersError) {
      console.error('Erreur lors de la création de la table users:', usersError);
    } else {
      console.log('Table users créée avec succès.');
    }

    // Création de la table skill_categories
    console.log('Création de la table skill_categories...');
    const { error: categoriesError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS skill_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT,
          colorClass TEXT
        );
      `
    });
    
    if (categoriesError) {
      console.error('Erreur lors de la création de la table skill_categories:', categoriesError);
    } else {
      console.log('Table skill_categories créée avec succès.');
    }

    // Création de la table skills
    console.log('Création de la table skills...');
    const { error: skillsError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS skills (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          categoryId INTEGER NOT NULL REFERENCES skill_categories(id),
          description TEXT
        );
      `
    });
    
    if (skillsError) {
      console.error('Erreur lors de la création de la table skills:', skillsError);
    } else {
      console.log('Table skills créée avec succès.');
    }

    // Création de la table user_skills
    console.log('Création de la table user_skills...');
    const { error: userSkillsError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_skills (
          id SERIAL PRIMARY KEY,
          userId INTEGER NOT NULL REFERENCES users(id),
          skillId INTEGER NOT NULL REFERENCES skills(id),
          isOffered BOOLEAN NOT NULL,
          experienceLevel TEXT NOT NULL,
          description TEXT
        );
      `
    });
    
    if (userSkillsError) {
      console.error('Erreur lors de la création de la table user_skills:', userSkillsError);
    } else {
      console.log('Table user_skills créée avec succès.');
    }

    // Création de la table exchanges
    console.log('Création de la table exchanges...');
    const { error: exchangesError } = await supabaseAdmin.rpc('execute_sql', {
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
        );
      `
    });
    
    if (exchangesError) {
      console.error('Erreur lors de la création de la table exchanges:', exchangesError);
    } else {
      console.log('Table exchanges créée avec succès.');
    }

    // Création de la table messages
    console.log('Création de la table messages...');
    const { error: messagesError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          senderId INTEGER NOT NULL REFERENCES users(id),
          receiverId INTEGER NOT NULL REFERENCES users(id),
          content TEXT NOT NULL,
          read BOOLEAN DEFAULT FALSE,
          createdAt TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (messagesError) {
      console.error('Erreur lors de la création de la table messages:', messagesError);
    } else {
      console.log('Table messages créée avec succès.');
    }

    // Création de la table reviews
    console.log('Création de la table reviews...');
    const { error: reviewsError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          exchangeId INTEGER NOT NULL REFERENCES exchanges(id),
          reviewerId INTEGER NOT NULL REFERENCES users(id),
          revieweeId INTEGER NOT NULL REFERENCES users(id),
          rating INTEGER NOT NULL,
          comment TEXT,
          createdAt TIMESTAMP DEFAULT NOW()
        );
      `
    });
    
    if (reviewsError) {
      console.error('Erreur lors de la création de la table reviews:', reviewsError);
    } else {
      console.log('Table reviews créée avec succès.');
    }

    // Création de la table notifications
    console.log('Création de la table notifications...');
    const { error: notificationsError } = await supabaseAdmin.rpc('execute_sql', {
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
        );
      `
    });
    
    if (notificationsError) {
      console.error('Erreur lors de la création de la table notifications:', notificationsError);
    } else {
      console.log('Table notifications créée avec succès.');
    }

    console.log('Toutes les tables ont été créées avec succès dans Supabase.');
  } catch (error) {
    console.error('Erreur lors de la création directe des tables dans Supabase:', error);
  }
}

// Exécuter la création des tables si ce script est appelé directement
if (require.main === module) {
  createTablesDirectly()
    .then(() => {
      console.log('Script de création des tables terminé.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur dans le script de création des tables:', error);
      process.exit(1);
    });
}

// Exporter les fonctions pour pouvoir les utiliser ailleurs
export { createSupabaseTables, createSqlFunctions, createTablesDirectly };