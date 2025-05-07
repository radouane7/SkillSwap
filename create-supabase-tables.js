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
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fonction pour créer les tables directement avec des appels à l'API Supabase
export async function createTablesDirectly() {
  try {
    console.log('Création des tables dans Supabase...');

    // Créer la table des utilisateurs
    console.log('Création de la table users...');
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError && usersError.code === 'PGRST301') {
      // La table n'existe pas, la créer
      const { error } = await supabase
        .from('users')
        .insert([
          { 
            username: 'admin',
            email: 'admin@example.com',
            password: 'placeholder',
            subscriptionStatus: 'free',
            verified: false,
            rating: 0,
            reviewCount: 0
          }
        ]);

      if (error && !error.message.includes('already exists')) {
        console.error('Erreur lors de la création de la table users:', error);
      } else {
        console.log('Table users créée avec succès');
      }
    } else {
      console.log('La table users existe déjà');
    }

    // Créer la table des catégories de compétences
    console.log('Création de la table skill_categories...');
    const { error: categoriesError } = await supabase
      .from('skill_categories')
      .select('id')
      .limit(1);

    if (categoriesError && categoriesError.code === 'PGRST301') {
      // La table n'existe pas, la créer
      const { error } = await supabase
        .from('skill_categories')
        .insert([
          { 
            name: 'Technologies', 
            icon: 'computer',
            colorClass: 'bg-blue-500'
          }
        ]);

      if (error && !error.message.includes('already exists')) {
        console.error('Erreur lors de la création de la table skill_categories:', error);
      } else {
        console.log('Table skill_categories créée avec succès');
      }
    } else {
      console.log('La table skill_categories existe déjà');
    }

    // Créer la table des compétences
    console.log('Création de la table skills...');
    const { error: skillsError } = await supabase
      .from('skills')
      .select('id')
      .limit(1);

    if (skillsError && skillsError.code === 'PGRST301') {
      // La table n'existe pas, la créer
      const { error } = await supabase
        .from('skills')
        .insert([
          { 
            name: 'JavaScript', 
            categoryId: 1,
            description: 'Programmation en JavaScript'
          }
        ]);

      if (error && !error.message.includes('already exists')) {
        console.error('Erreur lors de la création de la table skills:', error);
      } else {
        console.log('Table skills créée avec succès');
      }
    } else {
      console.log('La table skills existe déjà');
    }

    // Créer la table des compétences des utilisateurs
    console.log('Création de la table user_skills...');
    const { error: userSkillsError } = await supabase
      .from('user_skills')
      .select('id')
      .limit(1);

    if (userSkillsError && userSkillsError.code === 'PGRST301') {
      // La table n'existe pas, la créer
      const { error } = await supabase
        .from('user_skills')
        .insert([
          { 
            userId: 1, 
            skillId: 1,
            isOffered: true,
            experienceLevel: 'expert'
          }
        ]);

      if (error && !error.message.includes('already exists')) {
        console.error('Erreur lors de la création de la table user_skills:', error);
      } else {
        console.log('Table user_skills créée avec succès');
      }
    } else {
      console.log('La table user_skills existe déjà');
    }

    // Créer la table des échanges
    console.log('Création de la table exchanges...');
    const { error: exchangesError } = await supabase
      .from('exchanges')
      .select('id')
      .limit(1);

    if (exchangesError && exchangesError.code === 'PGRST301') {
      // La table n'existe pas, la créer
      const { error } = await supabase
        .from('exchanges')
        .insert([
          { 
            requestorId: 1, 
            providerId: 1,
            requestorSkillId: 1,
            providerSkillId: 1,
            status: 'pending',
            exchangeMethod: 'in-person'
          }
        ]).select();

      if (error && !error.message.includes('already exists')) {
        console.error('Erreur lors de la création de la table exchanges:', error);
      } else {
        console.log('Table exchanges créée avec succès');
        
        // Supprimer l'entrée de test
        if (!error) {
          const { data } = await supabase
            .from('exchanges')
            .delete()
            .eq('requestorId', 1)
            .eq('providerId', 1);
        }
      }
    } else {
      console.log('La table exchanges existe déjà');
    }

    // Créer la table des messages
    console.log('Création de la table messages...');
    const { error: messagesError } = await supabase
      .from('messages')
      .select('id')
      .limit(1);

    if (messagesError && messagesError.code === 'PGRST301') {
      // La table n'existe pas, la créer
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            senderId: 1, 
            receiverId: 1,
            content: 'Test message',
            read: false
          }
        ]).select();

      if (error && !error.message.includes('already exists')) {
        console.error('Erreur lors de la création de la table messages:', error);
      } else {
        console.log('Table messages créée avec succès');
        
        // Supprimer l'entrée de test
        if (!error) {
          const { data } = await supabase
            .from('messages')
            .delete()
            .eq('senderId', 1)
            .eq('receiverId', 1);
        }
      }
    } else {
      console.log('La table messages existe déjà');
    }

    // Créer la table des avis
    console.log('Création de la table reviews...');
    const { error: reviewsError } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);

    if (reviewsError && reviewsError.code === 'PGRST301') {
      // La table n'existe pas, la créer
      const { error } = await supabase
        .from('reviews')
        .insert([
          { 
            exchangeId: 1, 
            reviewerId: 1,
            revieweeId: 1,
            rating: 5,
            comment: 'Test review'
          }
        ]).select();

      if (error && !error.message.includes('already exists')) {
        console.error('Erreur lors de la création de la table reviews:', error);
      } else {
        console.log('Table reviews créée avec succès');
        
        // Supprimer l'entrée de test si possible
        if (!error) {
          const { data } = await supabase
            .from('reviews')
            .delete()
            .eq('reviewerId', 1)
            .eq('revieweeId', 1);
        }
      }
    } else {
      console.log('La table reviews existe déjà');
    }

    // Créer la table des notifications
    console.log('Création de la table notifications...');
    const { error: notificationsError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (notificationsError && notificationsError.code === 'PGRST301') {
      // La table n'existe pas, la créer
      const { error } = await supabase
        .from('notifications')
        .insert([
          { 
            userId: 1, 
            type: 'info',
            title: 'Test notification',
            message: 'This is a test notification',
            read: false
          }
        ]).select();

      if (error && !error.message.includes('already exists')) {
        console.error('Erreur lors de la création de la table notifications:', error);
      } else {
        console.log('Table notifications créée avec succès');
        
        // Supprimer l'entrée de test
        if (!error) {
          const { data } = await supabase
            .from('notifications')
            .delete()
            .eq('userId', 1)
            .eq('title', 'Test notification');
        }
      }
    } else {
      console.log('La table notifications existe déjà');
    }

    console.log('Création des tables terminée.');
    return true;
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
    return false;
  }
}

// Exécuter directement si le script est lancé directement
if (process.argv[1].includes('create-supabase-tables.js')) {
  createTablesDirectly().then(() => {
    console.log('Script terminé.');
    process.exit(0);
  }).catch(error => {
    console.error('Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  });
}