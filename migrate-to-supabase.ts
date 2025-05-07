import { db } from './db';
import { supabaseAdmin } from './supabase';
import { 
  users, skillCategories, skills, userSkills, 
  exchanges, messages, reviews, notifications 
} from '@shared/schema';

// Script de migration des données vers Supabase
async function migrateToSupabase() {
  try {
    console.log('Début de la migration des données vers Supabase...');
    
    // Migration des utilisateurs
    console.log('Migration des utilisateurs...');
    const usersData = await db.select().from(users);
    if (usersData.length > 0) {
      const { error: usersError } = await supabaseAdmin
        .from('users')
        .upsert(usersData);
      
      if (usersError) {
        console.error('Erreur lors de la migration des utilisateurs:', usersError);
      } else {
        console.log(`${usersData.length} utilisateurs migrés avec succès.`);
      }
    }
    
    // Migration des catégories de compétences
    console.log('Migration des catégories de compétences...');
    const categoriesData = await db.select().from(skillCategories);
    if (categoriesData.length > 0) {
      const { error: categoriesError } = await supabaseAdmin
        .from('skill_categories')
        .upsert(categoriesData);
      
      if (categoriesError) {
        console.error('Erreur lors de la migration des catégories:', categoriesError);
      } else {
        console.log(`${categoriesData.length} catégories migrées avec succès.`);
      }
    }
    
    // Migration des compétences
    console.log('Migration des compétences...');
    const skillsData = await db.select().from(skills);
    if (skillsData.length > 0) {
      const { error: skillsError } = await supabaseAdmin
        .from('skills')
        .upsert(skillsData);
      
      if (skillsError) {
        console.error('Erreur lors de la migration des compétences:', skillsError);
      } else {
        console.log(`${skillsData.length} compétences migrées avec succès.`);
      }
    }
    
    // Migration des compétences utilisateurs
    console.log('Migration des compétences utilisateurs...');
    const userSkillsData = await db.select().from(userSkills);
    if (userSkillsData.length > 0) {
      const { error: userSkillsError } = await supabaseAdmin
        .from('user_skills')
        .upsert(userSkillsData);
      
      if (userSkillsError) {
        console.error('Erreur lors de la migration des compétences utilisateurs:', userSkillsError);
      } else {
        console.log(`${userSkillsData.length} compétences utilisateurs migrées avec succès.`);
      }
    }
    
    // Migration des échanges
    console.log('Migration des échanges...');
    const exchangesData = await db.select().from(exchanges);
    if (exchangesData.length > 0) {
      const { error: exchangesError } = await supabaseAdmin
        .from('exchanges')
        .upsert(exchangesData);
      
      if (exchangesError) {
        console.error('Erreur lors de la migration des échanges:', exchangesError);
      } else {
        console.log(`${exchangesData.length} échanges migrés avec succès.`);
      }
    }
    
    // Migration des messages
    console.log('Migration des messages...');
    const messagesData = await db.select().from(messages);
    if (messagesData.length > 0) {
      const { error: messagesError } = await supabaseAdmin
        .from('messages')
        .upsert(messagesData);
      
      if (messagesError) {
        console.error('Erreur lors de la migration des messages:', messagesError);
      } else {
        console.log(`${messagesData.length} messages migrés avec succès.`);
      }
    }
    
    // Migration des avis
    console.log('Migration des avis...');
    const reviewsData = await db.select().from(reviews);
    if (reviewsData.length > 0) {
      const { error: reviewsError } = await supabaseAdmin
        .from('reviews')
        .upsert(reviewsData);
      
      if (reviewsError) {
        console.error('Erreur lors de la migration des avis:', reviewsError);
      } else {
        console.log(`${reviewsData.length} avis migrés avec succès.`);
      }
    }
    
    // Migration des notifications
    console.log('Migration des notifications...');
    const notificationsData = await db.select().from(notifications);
    if (notificationsData.length > 0) {
      const { error: notificationsError } = await supabaseAdmin
        .from('notifications')
        .upsert(notificationsData);
      
      if (notificationsError) {
        console.error('Erreur lors de la migration des notifications:', notificationsError);
      } else {
        console.log(`${notificationsData.length} notifications migrées avec succès.`);
      }
    }
    
    console.log('Migration vers Supabase terminée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la migration vers Supabase:', error);
  }
}

// Exécuter la migration si ce script est appelé directement
if (require.main === module) {
  migrateToSupabase()
    .then(() => {
      console.log('Script de migration terminé.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur dans le script de migration:', error);
      process.exit(1);
    });
}

// Exporter la fonction pour pouvoir l'utiliser ailleurs
export { migrateToSupabase };