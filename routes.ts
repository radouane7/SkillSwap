import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertUserSkillSchema, insertExchangeSchema, insertMessageSchema, insertReviewSchema, insertNotificationSchema, users, exchanges as exchangesTable } from "@shared/schema";
import { z } from "zod";
import { seedDatabase } from "./seed-data";
import Stripe from "stripe";
import { db } from "./db";
import { eq, ne } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payments will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // Firebase Authentication API
  app.post("/api/auth/firebase", async (req, res) => {
    const { firebaseUid, email, displayName, photoURL, provider } = req.body;
    
    if (!firebaseUid || !email || !provider) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
      // Vérifier si l'utilisateur avec ce Firebase UID existe déjà
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (user) {
        // Utilisateur existe déjà, lier la session
        req.login(user, (err) => {
          if (err) return res.status(500).json({ error: "Failed to establish session" });
          return res.json(user);
        });
      } else {
        // Vérifier si l'utilisateur avec cet email existe déjà
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Utilisateur existe, lier son compte Firebase
          user = await storage.linkUserWithFirebase(user.id, firebaseUid, provider);
          if (!user) {
            return res.status(500).json({ error: "Failed to link Firebase account" });
          }
          
          // Lier la session
          req.login(user, (err) => {
            if (err) return res.status(500).json({ error: "Failed to establish session" });
            return res.json(user);
          });
        } else {
          // Créer un nouvel utilisateur
          const username = displayName ? displayName.replace(/\s+/g, '.').toLowerCase() : email.split('@')[0];
          // Générer un mot de passe aléatoire
          const randomPassword = Array.from(
            { length: 16 },
            () => Math.floor(Math.random() * 36).toString(36)
          ).join('');
          
          // Extraire prénom et nom si disponibles
          let firstName = null;
          let lastName = null;
          if (displayName) {
            const nameParts = displayName.split(' ');
            if (nameParts.length > 0) {
              firstName = nameParts[0];
              if (nameParts.length > 1) {
                lastName = nameParts.slice(1).join(' ');
              }
            }
          }
          
          const newUser = await storage.createUser({
            username,
            email,
            password: randomPassword,
            firstName,
            lastName,
            profileImage: photoURL || null,
            firebaseUid,
            provider
          });
          
          // Lier la session
          req.login(newUser, (err) => {
            if (err) return res.status(500).json({ error: "Failed to establish session" });
            return res.status(201).json(newUser);
          });
        }
      }
    } catch (error) {
      console.error("Error in Firebase auth:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
  
  // Seed the database with sample data
  try {
    console.log("Starting to seed database with sample data...");
    await seedDatabase(storage);
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    // Continue with server startup even if seeding fails
  }

  // Skill Categories API
  app.get("/api/skill-categories", async (req, res) => {
    const categories = await storage.getSkillCategories();
    res.json(categories);
  });

  // Skills API
  app.get("/api/skills", async (req, res) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    if (categoryId) {
      const skills = await storage.getSkillsByCategory(categoryId);
      return res.json(skills);
    }
    
    const skills = await storage.getSkills();
    res.json(skills);
  });

  app.post("/api/skills", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const skillData = {
        name: req.body.name,
        categoryId: req.body.categoryId,
        description: req.body.description || null
      };
      
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      res.status(400).json({ error: "Invalid skill data" });
    }
  });

  // User Skills API
  app.get("/api/user-skills", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const userSkills = await storage.getUserSkills(userId);
    
    // Get the skill details for each user skill
    const detailedSkills = await Promise.all(
      userSkills.map(async (userSkill) => {
        const skill = await storage.getSkill(userSkill.skillId);
        return {
          ...userSkill,
          skill
        };
      })
    );
    
    res.json(detailedSkills);
  });

  app.post("/api/user-skills", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const validatedData = insertUserSkillSchema.parse({
        ...req.body,
        userId
      });
      
      const userSkill = await storage.createUserSkill(validatedData);
      res.status(201).json(userSkill);
    } catch (error) {
      res.status(400).json({ error: "Invalid user skill data" });
    }
  });

  app.put("/api/user-skills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userSkillId = parseInt(req.params.id);
    const userSkill = await storage.updateUserSkill(userSkillId, req.body);
    
    if (!userSkill) {
      return res.status(404).json({ error: "User skill not found" });
    }
    
    res.json(userSkill);
  });

  app.delete("/api/user-skills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userSkillId = parseInt(req.params.id);
    const success = await storage.deleteUserSkill(userSkillId);
    
    if (!success) {
      return res.status(404).json({ error: "User skill not found" });
    }
    
    res.status(204).send();
  });

  // User Profile Update API
  app.post("/api/update-profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const userData = req.body;
    
    try {
      // Empêcher la modification des champs sensibles
      delete userData.password;
      delete userData.email;
      delete userData.username;
      delete userData.rating;
      delete userData.reviewCount;
      delete userData.verified;
      delete userData.subscriptionStatus;
      delete userData.stripeCustomerId;
      delete userData.stripeSubscriptionId;
      delete userData.subscriptionExpiresAt;
      delete userData.monthlyProposalCount;
      delete userData.lastProposalReset;
      delete userData.firebaseUid;
      delete userData.provider;
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Erreur lors de la mise à jour du profil" });
    }
  });

  // Matching API
  app.get("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const matches = await storage.findMatches(userId);
    
    // Enhance matches with their skills
    const enhancedMatches = await Promise.all(
      matches.map(async (match) => {
        const offeredSkills = await storage.getUserOfferedSkills(match.id);
        const neededSkills = await storage.getUserNeededSkills(match.id);
        
        // Get detailed skill info
        const offeredWithDetails = await Promise.all(
          offeredSkills.map(async (offered) => {
            const skill = await storage.getSkill(offered.skillId);
            return { ...offered, skill };
          })
        );
        
        const neededWithDetails = await Promise.all(
          neededSkills.map(async (needed) => {
            const skill = await storage.getSkill(needed.skillId);
            return { ...needed, skill };
          })
        );
        
        return {
          ...match,
          offeredSkills: offeredWithDetails,
          neededSkills: neededWithDetails
        };
      })
    );
    
    res.json(enhancedMatches);
  });
  
  // API pour les utilisateurs qui ont besoin de mes compétences
  app.get("/api/users-who-need-my-skills", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    console.log(`[/api/users-who-need-my-skills] Recherche pour userId=${userId}`);
    
    const users = await storage.findUsersWhoNeedMySkills(userId);
    console.log(`[/api/users-who-need-my-skills] Nombre d'utilisateurs trouvés: ${users.length}`);
    
    // Améliorer les données utilisateur avec leurs compétences
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        const offeredSkills = await storage.getUserOfferedSkills(user.id);
        console.log(`[/api/users-who-need-my-skills] User ${user.id} a ${offeredSkills.length} compétences offertes`);
        
        const neededSkills = await storage.getUserNeededSkills(user.id);
        console.log(`[/api/users-who-need-my-skills] User ${user.id} a ${neededSkills.length} compétences recherchées`);
        
        // Obtenir les détails des compétences
        const offeredWithDetails = await Promise.all(
          offeredSkills.map(async (offered) => {
            const skill = await storage.getSkill(offered.skillId);
            return { ...offered, skill };
          })
        );
        
        const neededWithDetails = await Promise.all(
          neededSkills.map(async (needed) => {
            const skill = await storage.getSkill(needed.skillId);
            return { ...needed, skill };
          })
        );
        
        return {
          ...user,
          offeredSkills: offeredWithDetails,
          neededSkills: neededWithDetails
        };
      })
    );
    
    console.log(`[/api/users-who-need-my-skills] Envoi de ${enhancedUsers.length} utilisateurs`);
    res.json(enhancedUsers);
  });
  
  // API pour les utilisateurs qui offrent les compétences dont j'ai besoin
  app.get("/api/users-who-offer-skills-i-need", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const users = await storage.findUsersWhoOfferSkillsINeed(userId);
    
    // Améliorer les données utilisateur avec leurs compétences
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        const offeredSkills = await storage.getUserOfferedSkills(user.id);
        const neededSkills = await storage.getUserNeededSkills(user.id);
        
        // Obtenir les détails des compétences
        const offeredWithDetails = await Promise.all(
          offeredSkills.map(async (offered) => {
            const skill = await storage.getSkill(offered.skillId);
            return { ...offered, skill };
          })
        );
        
        const neededWithDetails = await Promise.all(
          neededSkills.map(async (needed) => {
            const skill = await storage.getSkill(needed.skillId);
            return { ...needed, skill };
          })
        );
        
        return {
          ...user,
          offeredSkills: offeredWithDetails,
          neededSkills: neededWithDetails
        };
      })
    );
    
    res.json(enhancedUsers);
  });

  // Exchanges API
  app.get("/api/exchanges", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const exchanges = await storage.getUserExchanges(userId);
    
    // Enhance exchanges with user and skill details
    const enhancedExchanges = await Promise.all(
      exchanges.map(async (exchange) => {
        const requestor = await storage.getUser(exchange.requestorId);
        const provider = await storage.getUser(exchange.providerId);
        const requestorSkill = await storage.getSkill(exchange.requestorSkillId);
        const providerSkill = await storage.getSkill(exchange.providerSkillId);
        
        return {
          ...exchange,
          requestor,
          provider,
          requestorSkill,
          providerSkill
        };
      })
    );
    
    res.json(enhancedExchanges);
  });

  app.post("/api/exchanges", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Received exchange data:", req.body);
      
      // Convert scheduledDate to Date object if it's a string
      let processedData = { ...req.body };
      if (typeof processedData.scheduledDate === 'string') {
        try {
          processedData.scheduledDate = new Date(processedData.scheduledDate);
          
          // Check if date is valid
          if (isNaN(processedData.scheduledDate.getTime())) {
            return res.status(400).json({ error: "Invalid date format for scheduledDate" });
          }
        } catch (dateError) {
          console.error("Date parse error:", dateError);
          return res.status(400).json({ error: "Could not parse scheduledDate" });
        }
      }
      
      // Handle if scheduledDate is explicitly null or undefined
      if (processedData.scheduledDate === null || processedData.scheduledDate === undefined) {
        console.log("scheduledDate is null or undefined, this is allowed");
      }
      
      try {
        const validatedData = insertExchangeSchema.parse(processedData);
        console.log("Validated data:", validatedData);
        
        // Ensure the requestor is the current user
        if (validatedData.requestorId !== req.user!.id) {
          return res.status(403).json({ error: "You can only create exchanges as yourself" });
        }
        
        const exchange = await storage.createExchange(validatedData);
        res.status(201).json(exchange);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        if (validationError instanceof z.ZodError) {
          const firstError = validationError.errors[0];
          return res.status(400).json({ 
            error: `Validation error: ${firstError.path.join('.')} - ${firstError.message}`,
            details: validationError.errors 
          });
        }
        throw validationError;
      }
    } catch (error) {
      console.error("Exchange creation error:", error);
      res.status(400).json({ error: "Invalid exchange data" });
    }
  });

  app.put("/api/exchanges/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const exchangeId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!["pending", "accepted", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const exchange = await storage.getExchange(exchangeId);
    
    if (!exchange) {
      return res.status(404).json({ error: "Exchange not found" });
    }
    
    // Only allow the provider to accept/reject, and either party to mark as completed/cancelled
    const userId = req.user!.id;
    if (status === "accepted" && exchange.providerId !== userId) {
      return res.status(403).json({ error: "Only the provider can accept exchanges" });
    }
    
    if (["completed", "cancelled"].includes(status) && 
        exchange.requestorId !== userId && exchange.providerId !== userId) {
      return res.status(403).json({ error: "You are not part of this exchange" });
    }
    
    const updatedExchange = await storage.updateExchangeStatus(exchangeId, status);
    res.json(updatedExchange);
  });
  
  // Mise à jour de la méthode d'échange (présentiel ou vidéo) et planification
  app.put("/api/exchanges/:id/method", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const exchangeId = parseInt(req.params.id);
    const { exchangeMethod, location, videoLink, scheduledDate } = req.body;
    
    if (!["in-person", "video", "phone"].includes(exchangeMethod)) {
      return res.status(400).json({ error: "Invalid exchange method" });
    }
    
    const exchange = await storage.getExchange(exchangeId);
    
    if (!exchange) {
      return res.status(404).json({ error: "Exchange not found" });
    }
    
    // Vérifier que l'utilisateur participe à l'échange
    const userId = req.user!.id;
    if (exchange.requestorId !== userId && exchange.providerId !== userId) {
      return res.status(403).json({ error: "You are not part of this exchange" });
    }
    
    // Pour in-person, vérifier que location est fourni
    if (exchangeMethod === "in-person" && !location) {
      return res.status(400).json({ error: "Location is required for in-person exchanges" });
    }
    
    // Pour video, vérifier que videoLink est fourni
    if (exchangeMethod === "video" && !videoLink) {
      return res.status(400).json({ error: "Video link is required for video exchanges" });
    }
    
    // Vérifier que la date est valide
    let parsedScheduledDate = scheduledDate;
    if (typeof scheduledDate === 'string') {
      try {
        parsedScheduledDate = new Date(scheduledDate);
        
        // Check if date is valid
        if (isNaN(parsedScheduledDate.getTime())) {
          return res.status(400).json({ error: "Invalid date format for scheduledDate" });
        }
      } catch (dateError) {
        console.error("Date parse error:", dateError);
        return res.status(400).json({ error: "Could not parse scheduledDate" });
      }
    }
    
    // Mise à jour de la méthode d'échange
    const updatedExchange = await storage.updateExchangeMethod(exchangeId, exchangeMethod, location, videoLink);
    
    // Mise à jour de la date planifiée si elle est fournie
    if (parsedScheduledDate) {
      // Mettre à jour le champ scheduledDate
      const exchangeWithDate = await db
        .update(exchangesTable)
        .set({ scheduledDate: parsedScheduledDate })
        .where(eq(exchangesTable.id, exchangeId))
        .returning();
      
      // Retourner l'échange mis à jour avec la nouvelle date
      if (exchangeWithDate.length > 0) {
        return res.json({
          ...updatedExchange,
          scheduledDate: parsedScheduledDate
        });
      }
    }
    
    res.json(updatedExchange);
  });
  
  // Confirmation de la completion d'un échange
  app.put("/api/exchanges/:id/confirm", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const exchangeId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    const exchange = await storage.getExchange(exchangeId);
    
    if (!exchange) {
      return res.status(404).json({ error: "Exchange not found" });
    }
    
    // Vérifier que l'utilisateur participe à l'échange
    if (exchange.requestorId !== userId && exchange.providerId !== userId) {
      return res.status(403).json({ error: "You are not part of this exchange" });
    }
    
    // Vérifier que l'échange est dans un état où il peut être confirmé (accepted)
    if (exchange.status !== "accepted") {
      return res.status(400).json({ error: "Only accepted exchanges can be confirmed" });
    }
    
    const updatedExchange = await storage.confirmExchangeCompletion(exchangeId, userId);
    res.json(updatedExchange);
  });

  // Messages API
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const userMessages = await storage.getUserMessages(userId);
    
    // Group messages by conversation partner
    const conversations = new Map();
    
    for (const message of userMessages) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, []);
      }
      
      conversations.get(partnerId).push(message);
    }
    
    // Get user details for each conversation
    const conversationsWithDetails = await Promise.all(
      Array.from(conversations.entries()).map(async ([partnerId, messages]) => {
        const partner = await storage.getUser(partnerId as number);
        const unreadCount = messages.filter((m: any) => m.receiverId === userId && !m.read).length;
        const latestMessage = messages.sort((a: any, b: any) => 
          (b.createdAt ? b.createdAt.getTime() : 0) - (a.createdAt ? a.createdAt.getTime() : 0)
        )[0];
        
        return {
          partner,
          unreadCount,
          latestMessage,
          messages
        };
      })
    );
    
    res.json(conversationsWithDetails);
  });

  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const currentUserId = req.user!.id;
    const partnerId = parseInt(req.params.userId);
    
    const messages = await storage.getMessages(currentUserId, partnerId);
    
    // Mark received messages as read
    for (const message of messages) {
      if (message.receiverId === currentUserId && !message.read) {
        await storage.markMessageAsRead(message.id);
      }
    }
    
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user!.id
      });
      
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Reviews API
  app.get("/api/reviews/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const reviews = await storage.getReviews(userId);
    
    // Enhance reviews with reviewer details
    const enhancedReviews = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await storage.getUser(review.reviewerId);
        return { ...review, reviewer };
      })
    );
    
    res.json(enhancedReviews);
  });
  
  // API d'abonnement
  app.get("/api/subscription", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = await storage.getUser(req.user!.id);
    if (!user) return res.sendStatus(404);
    
    // Information sur l'abonnement
    const subscriptionInfo = {
      status: user.subscriptionStatus || 'free',
      monthlyProposalCount: user.monthlyProposalCount || 0,
      expiresAt: user.subscriptionExpiresAt,
      hasActiveSubscription: user.subscriptionStatus === 'premium'
    };
    
    res.json(subscriptionInfo);
  });
  
  // Route pour créer un abonnement
  app.post("/api/create-subscription", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) return res.sendStatus(404);
      
      // Si l'utilisateur a déjà un abonnement actif
      if (user.subscriptionStatus === 'premium' && user.stripeSubscriptionId) {
        // Pour simplifier, nous simulons un client secret dans le format attendu
        const clientSecret = "pi_" + Math.random().toString(36).substring(2, 10) + "_secret_" + Math.random().toString(36).substring(2, 20);
        
        res.json({
          subscriptionId: user.stripeSubscriptionId,
          clientSecret
        });
        return;
      }
      
      // Créer ou récupérer le client Stripe
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        });
        
        customerId = customer.id;
        await storage.updateStripeCustomerId(user.id, customerId);
      }
      
      // Générer un ID d'abonnement fictif pour les tests
      const subscriptionId = "sub_test_" + Math.random().toString(36).substring(2, 15);
      
      // Simuler un clientSecret pour l'interface de paiement dans le format attendu
      const clientSecret = "pi_" + Math.random().toString(36).substring(2, 10) + "_secret_" + Math.random().toString(36).substring(2, 20);
      
      // Mettre à jour les informations d'abonnement dans la base de données
      await storage.updateUserStripeInfo(user.id, {
        customerId,
        subscriptionId
      });
      
      // Pour simplifier, on va immédiatement mettre à jour le statut de l'utilisateur à premium
      await storage.updateSubscriptionStatus(user.id, 'premium');
      
      // Définir une date d'expiration dans 30 jours
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await storage.updateSubscriptionExpiresAt(user.id, expiresAt);
      
      res.json({
        subscriptionId,
        clientSecret
      });
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      res.status(400).json({ error: error.message });
    }
  });
  
  // Webhook Stripe pour traiter les événements d'abonnement
  app.post("/api/webhook", async (req, res) => {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    
    let event;
    try {
      // Vérifier la signature du webhook
      const signature = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret
        );
      } else {
        // En développement, nous pouvons simplement analyser le corps
        event = req.body;
      }
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Traiter l'événement
    try {
      if (event.type === 'customer.subscription.created') {
        const subscription = event.data.object;
        
        // Mettre à jour l'état de l'abonnement de l'utilisateur
        const foundUsers = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscription.id));
        if (foundUsers.length > 0) {
          const user = foundUsers[0];
          await storage.updateSubscriptionStatus(user.id, 'premium');
          await storage.updateSubscriptionExpiresAt(user.id, new Date(subscription.current_period_end * 1000));
        }
      } else if (event.type === 'customer.subscription.updated') {
        // Mise à jour d'un abonnement
        const subscription = event.data.object;
        
        // Mise à jour du statut de l'abonnement
        const foundUsers = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscription.id));
        if (foundUsers.length > 0) {
          const user = foundUsers[0];
          if (subscription.status === 'active') {
            await storage.updateSubscriptionStatus(user.id, 'premium');
            await storage.updateSubscriptionExpiresAt(user.id, new Date(subscription.current_period_end * 1000));
          } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
            await storage.updateSubscriptionStatus(user.id, 'free');
          }
        }
      } else if (event.type === 'customer.subscription.deleted') {
        // Suppression d'un abonnement
        const subscription = event.data.object;
        
        // Réinitialisation du statut utilisateur
        const foundUsers = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscription.id));
        if (foundUsers.length > 0) {
          const user = foundUsers[0];
          await storage.updateSubscriptionStatus(user.id, 'free');
        }
      }
      
      res.json({ received: true });
    } catch (err) {
      console.error(`Error handling webhook: ${err}`);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: req.user!.id
      });
      
      // Ensure the reviewer is part of the exchange
      const exchange = await storage.getExchange(validatedData.exchangeId);
      
      if (!exchange) {
        return res.status(404).json({ error: "Exchange not found" });
      }
      
      if (exchange.requestorId !== req.user!.id && exchange.providerId !== req.user!.id) {
        return res.status(403).json({ error: "You can only review exchanges you participated in" });
      }
      
      // Ensure the exchange is completed
      if (exchange.status !== "completed") {
        return res.status(400).json({ error: "You can only review completed exchanges" });
      }
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: "Invalid review data" });
    }
  });

  // Notifications API
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const notifications = await storage.getNotifications(userId);
    res.json(notifications);
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const count = await storage.getUnreadNotificationsCount(userId);
    res.json(count);
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const notificationId = parseInt(req.params.id);
    const updatedNotification = await storage.markNotificationAsRead(notificationId);
    
    if (!updatedNotification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.json(updatedNotification);
  });
  
  app.post("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    await storage.markAllNotificationsAsRead(userId);
    res.status(200).json({ success: true });
  });

  // API pour récupérer tous les utilisateurs (pour la recherche)
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Exclure l'utilisateur actuel
    const currentUserId = req.user!.id;
    
    // Récupérer tous les utilisateurs sauf l'utilisateur connecté
    const allUsers = await db.select().from(users).where(ne(users.id, currentUserId));
    
    // Enhance users with their skills
    const enhancedUsers = await Promise.all(
      allUsers.map(async (user) => {
        const offeredSkills = await storage.getUserOfferedSkills(user.id);
        const neededSkills = await storage.getUserNeededSkills(user.id);
        
        // Enhance skills with skill details
        const enhancedOfferedSkills = await Promise.all(
          offeredSkills.map(async userSkill => {
            const skill = await storage.getSkill(userSkill.skillId);
            return { ...userSkill, skill };
          })
        );
        
        const enhancedNeededSkills = await Promise.all(
          neededSkills.map(async userSkill => {
            const skill = await storage.getSkill(userSkill.skillId);
            return { ...userSkill, skill };
          })
        );
        
        return {
          ...user,
          offeredSkills: enhancedOfferedSkills,
          neededSkills: enhancedNeededSkills
        };
      })
    );
    
    res.json(enhancedUsers);
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
