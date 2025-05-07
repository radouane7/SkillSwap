import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Configurer dotenv
config();

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erreur: Les variables d\'environnement SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY ne sont pas définies.');
  console.error('Assurez-vous de les définir dans le fichier .env');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fonction pour tester la connexion à Supabase
async function testConnection() {
  console.log('Test de connexion à Supabase...');
  console.log(`URL: ${process.env.SUPABASE_URL}`);
  console.log('Clé: ********' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(process.env.SUPABASE_SERVICE_ROLE_KEY.length - 4));
  
  try {
    // Essayer de récupérer la liste des tables
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Erreur lors de la connexion à Supabase:', error);
      return false;
    }
    
    console.log('Connexion à Supabase réussie !');
    console.log('Données récupérées:', data);
    return true;
  } catch (error) {
    console.error('Exception lors de la connexion à Supabase:', error);
    return false;
  }
}

// Fonction pour vérifier les tables existantes
async function checkTables() {
  console.log('\nVérification des tables dans Supabase...');
  
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
      const { data, error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact' });
      
      if (error) {
        console.error(`❌ La table '${table}' est inaccessible ou n'existe pas:`, error.message);
      } else {
        const count = data[0]?.count || 0;
        console.log(`✓ Table '${table}' existe: ${count} enregistrements`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification de la table '${table}':`, error.message);
    }
  }
}

// Exécution principale
async function main() {
  console.log('=========================================');
  console.log('VÉRIFICATION DE LA CONNEXION SUPABASE');
  console.log('=========================================\n');
  
  // Tester la connexion
  const connectionSuccess = await testConnection();
  
  // Si la connexion est réussie, vérifier les tables
  if (connectionSuccess) {
    await checkTables();
  }
  
  console.log('\n=========================================');
}

// Exécuter la fonction principale
main()
  .catch(error => {
    console.error('Erreur générale:', error);
  })
  .finally(() => {
    // Terminer proprement le processus
    process.exit(0);
  });