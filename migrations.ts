import { db, pool } from './db';
import { sql } from 'drizzle-orm';
import { migrateFirebaseFields } from './migrations/20250410_add_firebase_fields';
import { addCountryCityFields } from './migrations/add-country-city-fields';

export async function migrateSubscriptionFields() {
  console.log("Début de la migration des champs d'abonnement...");
  
  try {
    // Vérifier si les colonnes existent déjà
    const checkColumnResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'subscription_status'
    `);
    
    // Si la colonne existe déjà, on ne fait rien
    if (checkColumnResult.rows.length > 0) {
      console.log("Les colonnes d'abonnement existent déjà.");
      return;
    }
    
    // Ajouter les nouvelles colonnes
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN subscription_status TEXT DEFAULT 'free',
      ADD COLUMN stripe_customer_id TEXT,
      ADD COLUMN stripe_subscription_id TEXT,
      ADD COLUMN subscription_expires_at TIMESTAMP,
      ADD COLUMN monthly_proposal_count INTEGER DEFAULT 0,
      ADD COLUMN last_proposal_reset TIMESTAMP
    `);
    
    console.log("Colonnes d'abonnement ajoutées avec succès.");
    
    // Mettre à jour les utilisateurs existants pour initialiser les compteurs de proposition
    await pool.query(`
      UPDATE users
      SET monthly_proposal_count = 0,
          last_proposal_reset = NOW()
    `);
    
    console.log("Données des utilisateurs mises à jour avec succès.");
    
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    throw error;
  }
}

export async function migrateExchangeFields() {
  console.log("Début de la migration des champs d'échange...");
  
  try {
    // Vérifier si les colonnes existent déjà
    const checkColumnResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'exchanges' AND column_name = 'exchange_method'
    `);
    
    // Si la colonne existe déjà, on ne fait rien
    if (checkColumnResult.rows.length > 0) {
      console.log("Les colonnes d'échange existent déjà.");
      return;
    }
    
    // Ajouter les nouvelles colonnes
    await pool.query(`
      ALTER TABLE exchanges
      ADD COLUMN exchange_method TEXT,
      ADD COLUMN location TEXT,
      ADD COLUMN video_link TEXT,
      ADD COLUMN requestor_confirmed BOOLEAN DEFAULT false,
      ADD COLUMN provider_confirmed BOOLEAN DEFAULT false
    `);
    
    console.log("Colonnes d'échange ajoutées avec succès.");
    
  } catch (error) {
    console.error("Erreur lors de la migration des champs d'échange:", error);
    throw error;
  }
}