import { IStorage } from "./storage";
import { hashPassword } from "./auth";

export async function seedDatabase(storage: IStorage) {
  console.log("Starting to seed database with sample data...");
  
  // Add skill categories
  const categories = [
    { name: "Technologies", icon: "laptop-code", colorClass: "bg-blue-500" },
    { name: "Langues", icon: "language", colorClass: "bg-green-500" },
    { name: "Arts", icon: "paint-brush", colorClass: "bg-pink-500" },
    { name: "Musique", icon: "music", colorClass: "bg-purple-500" },
    { name: "Sports", icon: "running", colorClass: "bg-amber-500" },
    { name: "Cuisine", icon: "utensils", colorClass: "bg-red-500" },
  ];
  
  // Add skill categories if they don't exist
  const existingCategories = await storage.getSkillCategories();
  if (existingCategories.length === 0) {
    console.log("Adding skill categories...");
    for (const category of categories) {
      await storage.createSkillCategory(category);
    }
  }
  
  // Get all categories
  const allCategories = await storage.getSkillCategories();
  
  // Create skills for each category
  const skillsMap: Record<string, string[]> = {
    "Technologies": [
      "Développement Web",
      "Développement Mobile",
      "Intelligence Artificielle",
      "Cybersécurité",
      "Bases de données",
      "Cloud Computing"
    ],
    "Langues": [
      "Français",
      "Anglais",
      "Espagnol",
      "Allemand",
      "Italien",
      "Chinois",
      "Arabe"
    ],
    "Arts": [
      "Peinture",
      "Dessin",
      "Photographie",
      "Sculpture",
      "Graphisme"
    ],
    "Musique": [
      "Piano",
      "Guitare", 
      "Chant",
      "Batterie",
      "Violon",
      "Production musicale"
    ],
    "Sports": [
      "Yoga",
      "Fitness",
      "Football",
      "Tennis",
      "Natation",
      "Danse"
    ],
    "Cuisine": [
      "Cuisine française",
      "Cuisine italienne",
      "Cuisine asiatique",
      "Pâtisserie",
      "Cuisine végétarienne",
      "Cocktails"
    ]
  };
  
  // Create skills
  const existingSkills = await storage.getSkills();
  if (existingSkills.length === 0) {
    console.log("Adding skills...");
    for (const category of allCategories) {
      const categoryName = category.name;
      const skills = skillsMap[categoryName] || [];
      for (const skillName of skills) {
        await storage.createSkill({
          name: skillName,
          categoryId: category.id,
          description: `Compétence en ${skillName}`
        });
      }
    }
  }
  
  // Create sample users (if they don't already exist)
  const users = [
    {
      username: "sophie.martin",
      email: "sophie.martin@example.com",
      password: "Password123!",
      firstName: "Sophie",
      lastName: "Martin",
      location: "Paris",
      profileImage: null,
      bio: "Passionnée de design et de développement web, je cherche à échanger mes compétences contre des cours de cuisine."
    },
    {
      username: "thomas.dupont",
      email: "thomas.dupont@example.com",
      password: "Password123!",
      firstName: "Thomas",
      lastName: "Dupont",
      location: "Lyon",
      profileImage: null,
      bio: "Chef cuisinier professionnel, j'aimerais apprendre à coder en échange de cours de cuisine."
    },
    {
      username: "julie.leroy",
      email: "julie.leroy@example.com",
      password: "Password123!",
      firstName: "Julie",
      lastName: "Leroy",
      location: "Marseille",
      profileImage: null,
      bio: "Professeure d'anglais, je propose des cours de langue en échange de cours de yoga."
    },
    {
      username: "marc.petit",
      email: "marc.petit@example.com",
      password: "Password123!",
      firstName: "Marc",
      lastName: "Petit",
      location: "Bordeaux",
      profileImage: null,
      bio: "Passionné de photographie, je propose des séances photo en échange de cours de guitare."
    },
    {
      username: "chloe.dubois",
      email: "chloe.dubois@example.com",
      password: "Password123!",
      firstName: "Chloé",
      lastName: "Dubois",
      location: "Nice",
      profileImage: null,
      bio: "Professeure de yoga certifiée, je propose des cours personnalisés en échange de cours de pâtisserie."
    },
    {
      username: "lucas.moreau",
      email: "lucas.moreau@example.com",
      password: "Password123!",
      firstName: "Lucas",
      lastName: "Moreau",
      location: "Lille",
      profileImage: null,
      bio: "Pianiste professionnel, je donne des cours de piano et je cherche à améliorer mon anglais."
    },
    {
      username: "emma.bernard",
      email: "emma.bernard@example.com",
      password: "Password123!",
      firstName: "Emma",
      lastName: "Bernard",
      location: "Toulouse",
      profileImage: null,
      bio: "Graphiste freelance spécialisée en identité visuelle, je souhaite apprendre l'espagnol et la cuisine italienne."
    },
    {
      username: "antoine.rousseau",
      email: "antoine.rousseau@example.com",
      password: "Password123!",
      firstName: "Antoine",
      lastName: "Rousseau",
      location: "Montpellier",
      profileImage: null,
      bio: "Expert en cybersécurité, je propose des formations en sécurité informatique contre des cours de tennis."
    }
  ];
  
  // Check if users exist before creating them
  console.log("Adding users if needed...");
  const allUsers = [];
  for (const userData of users) {
    const existingUser = await storage.getUserByUsername(userData.username);
    if (!existingUser) {
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      allUsers.push(user);
    } else {
      allUsers.push(existingUser);
    }
  }
  
  // Get all skills
  const allSkills = await storage.getSkills();
  
  // Skills distribution for sample users
  const userSkillDistribution: Record<string, { offered: string[], needed: string[] }> = {
    "sophie.martin": {
      offered: ["Développement Web", "Graphisme"],
      needed: ["Cuisine française", "Pâtisserie"]
    },
    "thomas.dupont": {
      offered: ["Cuisine française", "Pâtisserie", "Cuisine italienne"],
      needed: ["Développement Web", "Bases de données"]
    },
    "julie.leroy": {
      offered: ["Anglais", "Français"],
      needed: ["Yoga", "Photographie"]
    },
    "marc.petit": {
      offered: ["Photographie", "Guitare"],
      needed: ["Piano", "Anglais"]
    },
    "chloe.dubois": {
      offered: ["Yoga", "Fitness"],
      needed: ["Pâtisserie", "Cuisine italienne"]
    },
    "lucas.moreau": {
      offered: ["Piano", "Production musicale"],
      needed: ["Anglais", "Espagnol"]
    },
    "emma.bernard": {
      offered: ["Graphisme", "Dessin"],
      needed: ["Espagnol", "Cuisine italienne"]
    },
    "antoine.rousseau": {
      offered: ["Cybersécurité", "Bases de données"],
      needed: ["Tennis", "Cuisine française"]
    }
  };
  
  // Add user skills
  console.log("Adding user skills...");
  for (const user of allUsers) {
    const userSkills = userSkillDistribution[user.username];
    if (userSkills) {
      // First check if the user already has skills to avoid duplicates
      const existingUserSkills = await storage.getUserSkills(user.id);
      
      // Add offered skills
      for (const skillName of userSkills.offered) {
        const skill = allSkills.find(s => s.name === skillName);
        if (skill && !existingUserSkills.some(us => us.skillId === skill.id && us.isOffered === true)) {
          await storage.createUserSkill({
            userId: user.id,
            skillId: skill.id,
            isOffered: true,
            experienceLevel: ["beginner", "intermediate", "expert"][Math.floor(Math.random() * 3)], 
            description: `Je peux enseigner ${skillName}`
          });
        }
      }
      
      // Add needed skills
      for (const skillName of userSkills.needed) {
        const skill = allSkills.find(s => s.name === skillName);
        if (skill && !existingUserSkills.some(us => us.skillId === skill.id && us.isOffered === false)) {
          await storage.createUserSkill({
            userId: user.id,
            skillId: skill.id,
            isOffered: false,
            experienceLevel: ["beginner", "intermediate"][Math.floor(Math.random() * 2)],
            description: `Je souhaite apprendre ${skillName}`
          });
        }
      }
    }
  }
  
  // Create some exchanges
  console.log("Adding sample exchanges...");
  const sophie = allUsers.find(u => u.username === "sophie.martin");
  const thomas = allUsers.find(u => u.username === "thomas.dupont");
  const julie = allUsers.find(u => u.username === "julie.leroy");
  const marc = allUsers.find(u => u.username === "marc.petit");
  const chloe = allUsers.find(u => u.username === "chloe.dubois");
  const lucas = allUsers.find(u => u.username === "lucas.moreau");
  const emma = allUsers.find(u => u.username === "emma.bernard");
  const antoine = allUsers.find(u => u.username === "antoine.rousseau");
  
  if (sophie && thomas) {
    const sophieSkills = await storage.getUserSkills(sophie.id);
    const thomasSkills = await storage.getUserSkills(thomas.id);
    
    const sophieOfferedSkill = sophieSkills.find(s => s.isOffered === true);
    const thomasOfferedSkill = thomasSkills.find(s => s.isOffered === true);
    
    if (sophieOfferedSkill && thomasOfferedSkill) {
      // Check if exchange exists
      const exchanges = await storage.getUserExchanges(sophie.id);
      const existingExchange = exchanges.find(e => 
        e.requestorId === sophie.id && 
        e.providerId === thomas.id && 
        e.requestorSkillId === thomasOfferedSkill.skillId &&
        e.providerSkillId === sophieOfferedSkill.skillId
      );
      
      if (!existingExchange) {
        // Create completed exchange between Sophie and Thomas
        const exchange = await storage.createExchange({
          requestorId: sophie.id,
          providerId: thomas.id,
          requestorSkillId: thomasOfferedSkill.skillId,
          providerSkillId: sophieOfferedSkill.skillId,
          scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        });
        
        // Update status to completed
        await storage.updateExchangeStatus(exchange.id, "completed");
        
        // Add reviews
        await storage.createReview({
          exchangeId: exchange.id,
          reviewerId: sophie.id,
          revieweeId: thomas.id,
          rating: 5,
          comment: "Thomas est un excellent professeur de cuisine! J'ai beaucoup appris et les recettes étaient délicieuses."
        });
        
        await storage.createReview({
          exchangeId: exchange.id,
          reviewerId: thomas.id,
          revieweeId: sophie.id,
          rating: 4,
          comment: "Sophie m'a très bien expliqué les bases du développement web. Je peux maintenant créer mon propre site!"
        });
      }
    }
  }
  
  if (julie && marc) {
    const julieSkills = await storage.getUserSkills(julie.id);
    const marcSkills = await storage.getUserSkills(marc.id);
    
    const julieOfferedSkill = julieSkills.find(s => s.isOffered === true);
    const marcOfferedSkill = marcSkills.find(s => s.isOffered === true);
    
    if (julieOfferedSkill && marcOfferedSkill) {
      // Check if exchange exists
      const exchanges = await storage.getUserExchanges(julie.id);
      const existingExchange = exchanges.find(e => 
        e.requestorId === julie.id && 
        e.providerId === marc.id
      );
      
      if (!existingExchange) {
        // Create pending exchange between Julie and Marc
        await storage.createExchange({
          requestorId: julie.id,
          providerId: marc.id,
          requestorSkillId: marcOfferedSkill.skillId,
          providerSkillId: julieOfferedSkill.skillId,
          scheduledDate: undefined
        });
      }
    }
  }
  
  // Créer d'autres échanges avec les nouveaux utilisateurs
  if (chloe && lucas) {
    const chloeSkills = await storage.getUserSkills(chloe.id);
    const lucasSkills = await storage.getUserSkills(lucas.id);
    
    const chloeOfferedSkill = chloeSkills.find(s => s.isOffered === true);
    const lucasOfferedSkill = lucasSkills.find(s => s.isOffered === true);
    
    if (chloeOfferedSkill && lucasOfferedSkill) {
      const exchanges = await storage.getUserExchanges(chloe.id);
      const existingExchange = exchanges.find(e => 
        e.requestorId === chloe.id && 
        e.providerId === lucas.id
      );
      
      if (!existingExchange) {
        // Créer un échange confirmé
        const exchange = await storage.createExchange({
          requestorId: chloe.id,
          providerId: lucas.id,
          requestorSkillId: lucasOfferedSkill.skillId,
          providerSkillId: chloeOfferedSkill.skillId,
          exchangeMethod: "in-person",
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Dans une semaine
        });
        
        // Mettre à jour le statut en confirmé
        await storage.updateExchangeStatus(exchange.id, "confirmed");
        
        // Configurer en présentiel
        await storage.updateExchangeMethod(
          exchange.id, 
          "in-person", 
          "Studio Yoga Zen, 12 rue de la Paix, Paris", 
          null
        );
      }
    }
  }
  
  if (emma && antoine) {
    const emmaSkills = await storage.getUserSkills(emma.id);
    const antoineSkills = await storage.getUserSkills(antoine.id);
    
    const emmaOfferedSkill = emmaSkills.find(s => s.isOffered === true);
    const antoineOfferedSkill = antoineSkills.find(s => s.isOffered === true);
    
    if (emmaOfferedSkill && antoineOfferedSkill) {
      const exchanges = await storage.getUserExchanges(emma.id);
      const existingExchange = exchanges.find(e => 
        e.requestorId === emma.id && 
        e.providerId === antoine.id
      );
      
      if (!existingExchange) {
        // Créer un échange complété
        const exchange = await storage.createExchange({
          requestorId: emma.id,
          providerId: antoine.id,
          requestorSkillId: antoineOfferedSkill.skillId,
          providerSkillId: emmaOfferedSkill.skillId,
          exchangeMethod: "in-person",
          scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 jours dans le passé
        });
        
        // Mettre à jour le statut en complété
        await storage.updateExchangeStatus(exchange.id, "completed");
        
        // Ajouter des avis
        await storage.createReview({
          exchangeId: exchange.id,
          reviewerId: emma.id,
          revieweeId: antoine.id,
          rating: 5,
          comment: "Antoine est un formateur incroyable en cybersécurité. Très pédagogue et patient!"
        });
        
        await storage.createReview({
          exchangeId: exchange.id,
          reviewerId: antoine.id,
          revieweeId: emma.id,
          rating: 5,
          comment: "Emma a un réel talent pour le graphisme. J'ai appris beaucoup de techniques utiles."
        });
      }
    }
  }
  
  // Créer un échange par visioconférence entre Sophie et Marc
  if (sophie && marc) {
    const sophieSkills = await storage.getUserSkills(sophie.id);
    const marcSkills = await storage.getUserSkills(marc.id);
    
    const sophieWebDevSkill = sophieSkills.find(s => s.isOffered === true && 
      allSkills.find(sk => sk.id === s.skillId)?.name === "Développement Web");
    const marcPhotoSkill = marcSkills.find(s => s.isOffered === true && 
      allSkills.find(sk => sk.id === s.skillId)?.name === "Photographie");
    
    if (sophieWebDevSkill && marcPhotoSkill) {
      const exchanges = await storage.getUserExchanges(sophie.id);
      const existingVideoExchange = exchanges.find(e => 
        e.requestorId === sophie.id && 
        e.providerId === marc.id &&
        e.exchangeMethod === "video"
      );
      
      if (!existingVideoExchange) {
        // Créer un échange planifié par visioconférence
        const exchange = await storage.createExchange({
          requestorId: sophie.id,
          providerId: marc.id,
          requestorSkillId: marcPhotoSkill.skillId,
          providerSkillId: sophieWebDevSkill.skillId,
          exchangeMethod: "video", // Visioconférence
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Dans 3 jours
        });
        
        // Définir comme accepté
        await storage.updateExchangeStatus(exchange.id, "accepted");
        
        // Configurer en mode visioconférence
        await storage.updateExchangeMethod(
          exchange.id, 
          "video", 
          null, 
          "https://meet.jit.si/skillswap-exchange-" + exchange.id
        );
      }
    }
  }

  // Add some messages
  console.log("Adding sample messages...");
  if (sophie && thomas) {
    const messages = await storage.getMessages(sophie.id, thomas.id);
    if (messages.length === 0) {
      // Create first message - read will default to false
      const msg1 = await storage.createMessage({
        senderId: sophie.id,
        receiverId: thomas.id,
        content: "Bonjour Thomas! J'ai vu que vous proposez des cours de cuisine française. Je serais intéressée par un échange contre des cours de développement web. Qu'en pensez-vous?"
      });
      
      // Mark it as read immediately
      await storage.markMessageAsRead(msg1.id);
      
      const msg2 = await storage.createMessage({
        senderId: thomas.id,
        receiverId: sophie.id,
        content: "Bonjour Sophie! Ça m'intéresse beaucoup. Je cherche justement à créer un site web pour partager mes recettes. Quand seriez-vous disponible pour commencer?"
      });
      
      await storage.markMessageAsRead(msg2.id);
      
      const msg3 = await storage.createMessage({
        senderId: sophie.id,
        receiverId: thomas.id,
        content: "Super! Je suis disponible les mardis et jeudis soirs. Est-ce que ça vous conviendrait?"
      });
      
      await storage.markMessageAsRead(msg3.id);
      
      const msg4 = await storage.createMessage({
        senderId: thomas.id,
        receiverId: sophie.id,
        content: "Parfait! Commençons mardi prochain à 18h. Je vous enverrai mon adresse par message. À bientôt!"
      });
      
      await storage.markMessageAsRead(msg4.id);
      
      const msg5 = await storage.createMessage({
        senderId: sophie.id,
        receiverId: thomas.id,
        content: "Merci encore pour les excellents cours de cuisine! J'ai préparé la recette ce weekend et ma famille a adoré!"
      });
      
      await storage.markMessageAsRead(msg5.id);
    }
  }
  
  if (julie && marc) {
    const messages = await storage.getMessages(julie.id, marc.id);
    if (messages.length === 0) {
      await storage.createMessage({
        senderId: julie.id,
        receiverId: marc.id,
        content: "Bonjour Marc, je suis intéressée par vos compétences en photographie. Seriez-vous disponible pour un échange contre des cours d'anglais?"
      });
      // We don't mark this as read to show an unread message in Marc's inbox
    }
  }
  
  if (chloe && lucas) {
    const messages = await storage.getMessages(chloe.id, lucas.id);
    if (messages.length === 0) {
      const msg1 = await storage.createMessage({
        senderId: chloe.id,
        receiverId: lucas.id,
        content: "Bonjour Lucas ! J'ai vu que vous proposez des cours de piano. Je cherche à apprendre un instrument et je pourrais vous offrir des cours de yoga en échange."
      });
      
      await storage.markMessageAsRead(msg1.id);
      
      const msg2 = await storage.createMessage({
        senderId: lucas.id,
        receiverId: chloe.id,
        content: "Bonjour Chloé ! Ça me paraît être un excellent échange. Le yoga m'intéresse beaucoup pour améliorer ma posture en jouant du piano. Quand pourriez-vous commencer ?"
      });
      
      await storage.markMessageAsRead(msg2.id);
      
      const msg3 = await storage.createMessage({
        senderId: chloe.id,
        receiverId: lucas.id,
        content: "Je suis disponible les lundis et mercredis après-midi. Nous pourrions faire une séance de yoga, puis une leçon de piano dans la foulée ?"
      });
      
      await storage.markMessageAsRead(msg3.id);
      
      const msg4 = await storage.createMessage({
        senderId: lucas.id,
        receiverId: chloe.id,
        content: "C'est parfait ! Commençons mercredi prochain à 14h. J'ai un piano chez moi, mais nous pouvons aussi aller dans un studio si vous préférez."
      });
      
      await storage.markMessageAsRead(msg4.id);
    }
  }
  
  if (emma && antoine) {
    const messages = await storage.getMessages(emma.id, antoine.id);
    if (messages.length === 0) {
      const msg1 = await storage.createMessage({
        senderId: emma.id,
        receiverId: antoine.id,
        content: "Bonjour Antoine, j'ai vu que vous êtes expert en cybersécurité. J'aurais besoin de conseils pour sécuriser mon site portfolio. En échange, je pourrais vous aider avec votre identité visuelle."
      });
      
      await storage.markMessageAsRead(msg1.id);
      
      const msg2 = await storage.createMessage({
        senderId: antoine.id,
        receiverId: emma.id,
        content: "Bonjour Emma, ça m'intéresse beaucoup. J'ai justement besoin de refaire mon logo et mes cartes de visite. Quand seriez-vous disponible pour en discuter ?"
      });
      
      await storage.markMessageAsRead(msg2.id);
      
      const msg3 = await storage.createMessage({
        senderId: emma.id,
        receiverId: antoine.id,
        content: "Je suis libre vendredi après-midi ou samedi matin. Qu'est-ce qui vous conviendrait le mieux ?"
      });
      
      await storage.markMessageAsRead(msg3.id);
      
      const msg4 = await storage.createMessage({
        senderId: antoine.id,
        receiverId: emma.id,
        content: "Samedi matin serait idéal. 10h chez moi ? Je vous envoie mon adresse en message privé."
      });
      
      await storage.markMessageAsRead(msg4.id);
      
      const msg5 = await storage.createMessage({
        senderId: emma.id,
        receiverId: antoine.id,
        content: "Merci pour cette session très enrichissante ! Les conseils que vous m'avez donnés ont permis de renforcer la sécurité de mon site. J'espère que vous êtes satisfait du logo que j'ai créé pour vous."
      });
      
      await storage.markMessageAsRead(msg5.id);
      
      const msg6 = await storage.createMessage({
        senderId: antoine.id,
        receiverId: emma.id,
        content: "Le logo est parfait, exactement ce que je recherchais ! N'hésitez pas à me recontacter si vous avez d'autres questions de sécurité pour votre site."
      });
      
      await storage.markMessageAsRead(msg6.id);
    }
  }
  
  console.log("Database seeding completed successfully!");
}