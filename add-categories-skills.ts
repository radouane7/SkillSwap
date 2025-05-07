import { db } from './server/db';
import { skillCategories, skills } from './shared/schema';

async function addCategoriesAndSkills() {
  console.log("Ajout de nouvelles catégories et compétences...");

  // Nouvelles catégories à ajouter
  const newCategories = [
    // Catégories existantes: Technologies, Langues, Arts, Sports, Cuisine, Éducation, Finance
    { name: "Bien-être", icon: "heart", colorClass: "bg-red-500" },
    { name: "Musique", icon: "music", colorClass: "bg-purple-500" },
    { name: "Bricolage", icon: "tool", colorClass: "bg-amber-600" },
    { name: "Jardin", icon: "flower", colorClass: "bg-green-500" },
    { name: "Photographie", icon: "camera", colorClass: "bg-blue-400" },
    { name: "Mode et Couture", icon: "scissors", colorClass: "bg-pink-400" },
    { name: "Sciences", icon: "atom", colorClass: "bg-cyan-500" },
    { name: "Voyage", icon: "map", colorClass: "bg-yellow-500" },
    { name: "Danse", icon: "dancing", colorClass: "bg-rose-500" },
    { name: "Artisanat", icon: "gift", colorClass: "bg-orange-500" },
    { name: "Parentalité", icon: "baby", colorClass: "bg-violet-400" },
    { name: "Animaux", icon: "pawprint", colorClass: "bg-amber-500" },
    { name: "Écologie", icon: "leaf", colorClass: "bg-emerald-600" },
    { name: "Entrepreneuriat", icon: "briefcase", colorClass: "bg-blue-600" },
    { name: "Développement personnel", icon: "lightbulb", colorClass: "bg-indigo-500" },
    { name: "Méditation", icon: "wind", colorClass: "bg-teal-500" }
  ];

  // Insérer les nouvelles catégories
  for (const category of newCategories) {
    try {
      const result = await db.insert(skillCategories).values(category).returning();
      console.log(`Catégorie ajoutée: ${category.name} (ID: ${result[0].id})`);
    } catch (error) {
      console.error(`Erreur lors de l'ajout de la catégorie ${category.name}:`, error);
    }
  }

  // Récupérer toutes les catégories pour avoir leurs IDs
  const allCategories = await db.select().from(skillCategories);
  const categoryMap = new Map(allCategories.map(cat => [cat.name, cat.id]));

  // Nouvelles compétences par catégorie
  const newSkills = [
    // Bien-être
    { name: "Yoga", categoryId: categoryMap.get("Bien-être") || 0 },
    { name: "Massage", categoryId: categoryMap.get("Bien-être") || 0 },
    { name: "Aromathérapie", categoryId: categoryMap.get("Bien-être") || 0 },
    { name: "Réflexologie", categoryId: categoryMap.get("Bien-être") || 0 },
    { name: "Relaxation", categoryId: categoryMap.get("Bien-être") || 0 },
    { name: "Pilates", categoryId: categoryMap.get("Bien-être") || 0 },
    { name: "Naturopathie", categoryId: categoryMap.get("Bien-être") || 0 },
    
    // Musique
    { name: "Piano", categoryId: categoryMap.get("Musique") || 0 },
    { name: "Guitare", categoryId: categoryMap.get("Musique") || 0 },
    { name: "Violon", categoryId: categoryMap.get("Musique") || 0 },
    { name: "Batterie", categoryId: categoryMap.get("Musique") || 0 },
    { name: "Chant", categoryId: categoryMap.get("Musique") || 0 },
    { name: "DJ", categoryId: categoryMap.get("Musique") || 0 },
    { name: "Composition musicale", categoryId: categoryMap.get("Musique") || 0 },
    { name: "Production musicale", categoryId: categoryMap.get("Musique") || 0 },
    
    // Bricolage
    { name: "Menuiserie", categoryId: categoryMap.get("Bricolage") || 0 },
    { name: "Plomberie", categoryId: categoryMap.get("Bricolage") || 0 },
    { name: "Électricité", categoryId: categoryMap.get("Bricolage") || 0 },
    { name: "Peinture", categoryId: categoryMap.get("Bricolage") || 0 },
    { name: "Rénovation", categoryId: categoryMap.get("Bricolage") || 0 },
    { name: "Construction", categoryId: categoryMap.get("Bricolage") || 0 },
    
    // Jardin
    { name: "Jardinage", categoryId: categoryMap.get("Jardin") || 0 },
    { name: "Botanique", categoryId: categoryMap.get("Jardin") || 0 },
    { name: "Permaculture", categoryId: categoryMap.get("Jardin") || 0 },
    { name: "Potager", categoryId: categoryMap.get("Jardin") || 0 },
    { name: "Arboriculture", categoryId: categoryMap.get("Jardin") || 0 },
    { name: "Bonsaï", categoryId: categoryMap.get("Jardin") || 0 },
    
    // Photographie
    { name: "Portrait", categoryId: categoryMap.get("Photographie") || 0 },
    { name: "Paysage", categoryId: categoryMap.get("Photographie") || 0 },
    { name: "Photographie de rue", categoryId: categoryMap.get("Photographie") || 0 },
    { name: "Photographie de mariage", categoryId: categoryMap.get("Photographie") || 0 },
    { name: "Retouche photo", categoryId: categoryMap.get("Photographie") || 0 },
    { name: "Éclairage", categoryId: categoryMap.get("Photographie") || 0 },
    
    // Mode et Couture
    { name: "Couture", categoryId: categoryMap.get("Mode et Couture") || 0 },
    { name: "Tricot", categoryId: categoryMap.get("Mode et Couture") || 0 },
    { name: "Crochet", categoryId: categoryMap.get("Mode et Couture") || 0 },
    { name: "Design de mode", categoryId: categoryMap.get("Mode et Couture") || 0 },
    { name: "Stylisme", categoryId: categoryMap.get("Mode et Couture") || 0 },
    
    // Sciences
    { name: "Astronomie", categoryId: categoryMap.get("Sciences") || 0 },
    { name: "Physique", categoryId: categoryMap.get("Sciences") || 0 },
    { name: "Chimie", categoryId: categoryMap.get("Sciences") || 0 },
    { name: "Biologie", categoryId: categoryMap.get("Sciences") || 0 },
    { name: "Mathématiques", categoryId: categoryMap.get("Sciences") || 0 },
    { name: "Géologie", categoryId: categoryMap.get("Sciences") || 0 },
    
    // Voyage
    { name: "Planification de voyage", categoryId: categoryMap.get("Voyage") || 0 },
    { name: "Randonnée", categoryId: categoryMap.get("Voyage") || 0 },
    { name: "Camping", categoryId: categoryMap.get("Voyage") || 0 },
    { name: "Écotourisme", categoryId: categoryMap.get("Voyage") || 0 },
    { name: "Voyage à petit budget", categoryId: categoryMap.get("Voyage") || 0 },
    
    // Danse
    { name: "Salsa", categoryId: categoryMap.get("Danse") || 0 },
    { name: "Tango", categoryId: categoryMap.get("Danse") || 0 },
    { name: "Ballet", categoryId: categoryMap.get("Danse") || 0 },
    { name: "Hip-hop", categoryId: categoryMap.get("Danse") || 0 },
    { name: "Danse contemporaine", categoryId: categoryMap.get("Danse") || 0 },
    { name: "Breakdance", categoryId: categoryMap.get("Danse") || 0 },
    
    // Artisanat
    { name: "Poterie", categoryId: categoryMap.get("Artisanat") || 0 },
    { name: "Bijouterie", categoryId: categoryMap.get("Artisanat") || 0 },
    { name: "Travail du cuir", categoryId: categoryMap.get("Artisanat") || 0 },
    { name: "Sculpture", categoryId: categoryMap.get("Artisanat") || 0 },
    { name: "Macramé", categoryId: categoryMap.get("Artisanat") || 0 },
    { name: "Calligraphie", categoryId: categoryMap.get("Artisanat") || 0 },
    
    // Parentalité
    { name: "Éducation des enfants", categoryId: categoryMap.get("Parentalité") || 0 },
    { name: "Nutrition infantile", categoryId: categoryMap.get("Parentalité") || 0 },
    { name: "Sommeil du bébé", categoryId: categoryMap.get("Parentalité") || 0 },
    { name: "Activités pour enfants", categoryId: categoryMap.get("Parentalité") || 0 },
    { name: "Gestion des colères", categoryId: categoryMap.get("Parentalité") || 0 },
    
    // Animaux
    { name: "Dressage de chiens", categoryId: categoryMap.get("Animaux") || 0 },
    { name: "Soins pour animaux", categoryId: categoryMap.get("Animaux") || 0 },
    { name: "Nutrition animale", categoryId: categoryMap.get("Animaux") || 0 },
    { name: "Toilettage", categoryId: categoryMap.get("Animaux") || 0 },
    { name: "Comportement animal", categoryId: categoryMap.get("Animaux") || 0 },
    
    // Écologie
    { name: "Zéro déchet", categoryId: categoryMap.get("Écologie") || 0 },
    { name: "Compostage", categoryId: categoryMap.get("Écologie") || 0 },
    { name: "Recyclage créatif", categoryId: categoryMap.get("Écologie") || 0 },
    { name: "Énergie renouvelable", categoryId: categoryMap.get("Écologie") || 0 },
    { name: "Mode de vie durable", categoryId: categoryMap.get("Écologie") || 0 },
    
    // Entrepreneuriat
    { name: "Création d'entreprise", categoryId: categoryMap.get("Entrepreneuriat") || 0 },
    { name: "Marketing digital", categoryId: categoryMap.get("Entrepreneuriat") || 0 },
    { name: "Réseaux sociaux", categoryId: categoryMap.get("Entrepreneuriat") || 0 },
    { name: "Vente", categoryId: categoryMap.get("Entrepreneuriat") || 0 },
    { name: "Gestion d'équipe", categoryId: categoryMap.get("Entrepreneuriat") || 0 },
    { name: "Comptabilité", categoryId: categoryMap.get("Entrepreneuriat") || 0 },
    
    // Développement personnel
    { name: "Prise de parole", categoryId: categoryMap.get("Développement personnel") || 0 },
    { name: "Gestion du temps", categoryId: categoryMap.get("Développement personnel") || 0 },
    { name: "Gestion du stress", categoryId: categoryMap.get("Développement personnel") || 0 },
    { name: "Confiance en soi", categoryId: categoryMap.get("Développement personnel") || 0 },
    { name: "Communication", categoryId: categoryMap.get("Développement personnel") || 0 },
    
    // Méditation
    { name: "Méditation pleine conscience", categoryId: categoryMap.get("Méditation") || 0 },
    { name: "Méditation guidée", categoryId: categoryMap.get("Méditation") || 0 },
    { name: "Respiration", categoryId: categoryMap.get("Méditation") || 0 },
    { name: "Sophrologie", categoryId: categoryMap.get("Méditation") || 0 },
    { name: "Tai-chi", categoryId: categoryMap.get("Méditation") || 0 },
    { name: "Qi Gong", categoryId: categoryMap.get("Méditation") || 0 },
    
    // Ajouter des compétences aux catégories existantes
    // Technologies
    { name: "Intelligence artificielle", categoryId: categoryMap.get("Technologies") || 0 },
    { name: "Blockchain", categoryId: categoryMap.get("Technologies") || 0 },
    { name: "Cybersécurité", categoryId: categoryMap.get("Technologies") || 0 },
    { name: "UX/UI Design", categoryId: categoryMap.get("Technologies") || 0 },
    { name: "Cloud Computing", categoryId: categoryMap.get("Technologies") || 0 },
    { name: "DevOps", categoryId: categoryMap.get("Technologies") || 0 },
    
    // Langues
    { name: "Arabe", categoryId: categoryMap.get("Langues") || 0 },
    { name: "Russe", categoryId: categoryMap.get("Langues") || 0 },
    { name: "Japonais", categoryId: categoryMap.get("Langues") || 0 },
    { name: "Portugais", categoryId: categoryMap.get("Langues") || 0 },
    { name: "Néerlandais", categoryId: categoryMap.get("Langues") || 0 },
    
    // Arts
    { name: "Dessin manga", categoryId: categoryMap.get("Arts") || 0 },
    { name: "Art numérique", categoryId: categoryMap.get("Arts") || 0 },
    { name: "Gravure", categoryId: categoryMap.get("Arts") || 0 },
    { name: "Animation", categoryId: categoryMap.get("Arts") || 0 },
    { name: "Aquarelle", categoryId: categoryMap.get("Arts") || 0 },
    
    // Sports
    { name: "Escalade", categoryId: categoryMap.get("Sports") || 0 },
    { name: "Surf", categoryId: categoryMap.get("Sports") || 0 },
    { name: "Trail", categoryId: categoryMap.get("Sports") || 0 },
    { name: "Arts martiaux", categoryId: categoryMap.get("Sports") || 0 },
    { name: "Padel", categoryId: categoryMap.get("Sports") || 0 },
    
    // Cuisine
    { name: "Cuisine végétarienne", categoryId: categoryMap.get("Cuisine") || 0 },
    { name: "Cuisine asiatique", categoryId: categoryMap.get("Cuisine") || 0 },
    { name: "Boulangerie", categoryId: categoryMap.get("Cuisine") || 0 },
    { name: "Fermentation", categoryId: categoryMap.get("Cuisine") || 0 },
    { name: "Œnologie", categoryId: categoryMap.get("Cuisine") || 0 },
    { name: "Mixologie", categoryId: categoryMap.get("Cuisine") || 0 },
    
    // Éducation
    { name: "Pédagogie Montessori", categoryId: categoryMap.get("Éducation") || 0 },
    { name: "Tutorat", categoryId: categoryMap.get("Éducation") || 0 },
    { name: "Préparation aux examens", categoryId: categoryMap.get("Éducation") || 0 },
    { name: "Méthode de mémorisation", categoryId: categoryMap.get("Éducation") || 0 },
    { name: "Orientation scolaire", categoryId: categoryMap.get("Éducation") || 0 },
    
    // Finance
    { name: "Investissement immobilier", categoryId: categoryMap.get("Finance") || 0 },
    { name: "Cryptomonnaies", categoryId: categoryMap.get("Finance") || 0 },
    { name: "Planification de retraite", categoryId: categoryMap.get("Finance") || 0 },
    { name: "Épargne", categoryId: categoryMap.get("Finance") || 0 },
    { name: "Gestion de dette", categoryId: categoryMap.get("Finance") || 0 }
  ];

  // Insérer les nouvelles compétences
  for (const skill of newSkills) {
    if (skill.categoryId === 0) {
      console.error(`Catégorie non trouvée pour la compétence ${skill.name}`);
      continue;
    }
    
    try {
      const result = await db.insert(skills).values(skill).returning();
      console.log(`Compétence ajoutée: ${skill.name} (Catégorie: ${skill.categoryId})`);
    } catch (error) {
      console.error(`Erreur lors de l'ajout de la compétence ${skill.name}:`, error);
    }
  }

  console.log("Processus d'ajout terminé!");
}

// Exécuter la fonction
addCategoriesAndSkills().catch(console.error);