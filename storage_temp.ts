import { users, User, InsertUser, skillCategories, SkillCategory, InsertSkillCategory, 
  skills, Skill, InsertSkill, userSkills, UserSkill, InsertUserSkill, 
  exchanges, Exchange, InsertExchange, messages, Message, InsertMessage,
  reviews, Review, InsertReview } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, or, ne, inArray } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Abonnements
  updateSubscriptionStatus(userId: number, status: string): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined>;
  updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined>;
  updateSubscriptionExpiresAt(userId: number, expiresAt: Date): Promise<User | undefined>;
  incrementMonthlyProposalCount(userId: number): Promise<number>;
  resetMonthlyProposalCount(userId: number): Promise<void>;
  updateUserStripeInfo(userId: number, data: { customerId: string, subscriptionId: string }): Promise<User | undefined>;
  
  // Skill Categories
  getSkillCategories(): Promise<SkillCategory[]>;
  getSkillCategory(id: number): Promise<SkillCategory | undefined>;
  createSkillCategory(category: InsertSkillCategory): Promise<SkillCategory>;
  
  // Skills
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillsByCategory(categoryId: number): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  
  // User Skills
  getUserSkills(userId: number): Promise<UserSkill[]>;
  getUserOfferedSkills(userId: number): Promise<UserSkill[]>;
  getUserNeededSkills(userId: number): Promise<UserSkill[]>;
  createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  updateUserSkill(id: number, data: Partial<UserSkill>): Promise<UserSkill | undefined>;
  deleteUserSkill(id: number): Promise<boolean>;
  
  // Exchanges
  getExchanges(): Promise<Exchange[]>;
  getExchange(id: number): Promise<Exchange | undefined>;
  getUserExchanges(userId: number): Promise<Exchange[]>;
  createExchange(exchange: InsertExchange): Promise<Exchange>;
  updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined>;
  updateExchangeMethod(id: number, exchangeMethod: string, location?: string, videoLink?: string): Promise<Exchange | undefined>;
  confirmExchangeCompletion(id: number, userId: number): Promise<Exchange | undefined>;
  
  // Messages
  getMessages(senderId: number, receiverId: number): Promise<Message[]>;
  getUserMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Reviews
  getReviews(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Matching
  findMatches(userId: number): Promise<User[]>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  private users: Map<number, User>;
  private skillCategories: Map<number, SkillCategory>;
  private skills: Map<number, Skill>;
  private userSkills: Map<number, UserSkill>;
  private exchanges: Map<number, Exchange>;
  private messages: Map<number, Message>;
  private reviews: Map<number, Review>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private skillIdCounter: number;
  private userSkillIdCounter: number;
  private exchangeIdCounter: number;
  private messageIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    this.users = new Map();
    this.skillCategories = new Map();
    this.skills = new Map();
    this.userSkills = new Map();
    this.exchanges = new Map();
    this.messages = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.skillIdCounter = 1;
    this.userSkillIdCounter = 1;
    this.exchangeIdCounter = 1;
    this.messageIdCounter = 1;
    this.reviewIdCounter = 1;
    
    // Pre-populate skill categories
    this.initializeSkillCategories();
  }

  private initializeSkillCategories() {
    const categories: InsertSkillCategory[] = [
      { name: "Technologies", icon: "laptop-code", colorClass: "primary" },
      { name: "Art & Design", icon: "palette", colorClass: "secondary" },
      { name: "Musique", icon: "music", colorClass: "yellow" },
      { name: "Cuisine", icon: "utensils", colorClass: "red" },
      { name: "Langues", icon: "language", colorClass: "purple" },
      { name: "Bien-être", icon: "leaf", colorClass: "green" }
    ];
    
    for (const category of categories) {
      this.createSkillCategory(category);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      rating: 0, 
      reviewCount: 0, 
      verified: false, 
      createdAt 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Méthodes d'abonnement
  async updateSubscriptionStatus(userId: number, status: string): Promise<User | undefined> {
    return this.updateUser(userId, { subscriptionStatus: status });
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    return this.updateUser(userId, { stripeCustomerId: customerId });
  }
  
  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
    return this.updateUser(userId, { stripeSubscriptionId: subscriptionId });
  }
  
  async updateSubscriptionExpiresAt(userId: number, expiresAt: Date): Promise<User | undefined> {
    return this.updateUser(userId, { subscriptionExpiresAt: expiresAt });
  }
  
  async incrementMonthlyProposalCount(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const newCount = (user.monthlyProposalCount || 0) + 1;
    await this.updateUser(userId, { 
      monthlyProposalCount: newCount,
      lastProposalReset: user.lastProposalReset || new Date()
    });
    
    return newCount;
  }
  
  async resetMonthlyProposalCount(userId: number): Promise<void> {
    await this.updateUser(userId, { 
      monthlyProposalCount: 0,
      lastProposalReset: new Date()
    });
  }
  
  async updateUserStripeInfo(userId: number, data: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    return this.updateUser(userId, {
      stripeCustomerId: data.customerId,
      stripeSubscriptionId: data.subscriptionId,
      subscriptionStatus: 'premium'
    });
  }

  // Skill Categories methods
  async getSkillCategories(): Promise<SkillCategory[]> {
    return Array.from(this.skillCategories.values());
  }

  async getSkillCategory(id: number): Promise<SkillCategory | undefined> {
    return this.skillCategories.get(id);
  }

  async createSkillCategory(category: InsertSkillCategory): Promise<SkillCategory> {
    const id = this.categoryIdCounter++;
    const newCategory: SkillCategory = { ...category, id };
    this.skillCategories.set(id, newCategory);
    return newCategory;
  }

  // Skills methods
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async getSkillsByCategory(categoryId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.categoryId === categoryId
    );
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.skillIdCounter++;
    const newSkill: Skill = { ...skill, id };
    this.skills.set(id, newSkill);
    return newSkill;
  }

  // User Skills methods
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return Array.from(this.userSkills.values()).filter(
      (userSkill) => userSkill.userId === userId
    );
  }

  async getUserOfferedSkills(userId: number): Promise<UserSkill[]> {
    return Array.from(this.userSkills.values()).filter(
      (userSkill) => userSkill.userId === userId && userSkill.isOffered
    );
  }

  async getUserNeededSkills(userId: number): Promise<UserSkill[]> {
    return Array.from(this.userSkills.values()).filter(
      (userSkill) => userSkill.userId === userId && !userSkill.isOffered
    );
  }

  async createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    const id = this.userSkillIdCounter++;
    const newUserSkill: UserSkill = { ...userSkill, id };
    this.userSkills.set(id, newUserSkill);
    return newUserSkill;
  }

  async updateUserSkill(id: number, data: Partial<UserSkill>): Promise<UserSkill | undefined> {
    const userSkill = this.userSkills.get(id);
    if (!userSkill) return undefined;
    
    const updatedUserSkill = { ...userSkill, ...data };
    this.userSkills.set(id, updatedUserSkill);
    return updatedUserSkill;
  }

  async deleteUserSkill(id: number): Promise<boolean> {
    return this.userSkills.delete(id);
  }

  // Exchanges methods
  async getExchanges(): Promise<Exchange[]> {
    return Array.from(this.exchanges.values());
  }

  async getExchange(id: number): Promise<Exchange | undefined> {
    return this.exchanges.get(id);
  }

  async getUserExchanges(userId: number): Promise<Exchange[]> {
    return Array.from(this.exchanges.values()).filter(
      (exchange) => exchange.requestorId === userId || exchange.providerId === userId
    );
  }

  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const id = this.exchangeIdCounter++;
    const createdAt = new Date();
    const newExchange: Exchange = { 
      ...exchange, 
      id, 
      status: "pending", 
      createdAt 
    };
    this.exchanges.set(id, newExchange);
    return newExchange;
  }

  async updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined> {
    const exchange = this.exchanges.get(id);
    if (!exchange) return undefined;
    
    const updatedExchange = { ...exchange, status };
    this.exchanges.set(id, updatedExchange);
    return updatedExchange;
  }
  
  async updateExchangeMethod(id: number, exchangeMethod: string, location?: string, videoLink?: string): Promise<Exchange | undefined> {
    const exchange = this.exchanges.get(id);
    if (!exchange) return undefined;
    
    const updatedExchange = { 
      ...exchange, 
      exchangeMethod,
      location: exchangeMethod === "in-person" ? location : null,
      videoLink: exchangeMethod === "video" ? videoLink : null
    };
    this.exchanges.set(id, updatedExchange);
    return updatedExchange;
  }
  
  async confirmExchangeCompletion(id: number, userId: number): Promise<Exchange | undefined> {
    const exchange = this.exchanges.get(id);
    if (!exchange) return undefined;
    
    // Vérifier si l'utilisateur est bien participant à l'échange
    const isRequestor = exchange.requestorId === userId;
    const isProvider = exchange.providerId === userId;
    
    if (!isRequestor && !isProvider) return undefined;
    
    const updatedExchange = { 
      ...exchange,
      requestorConfirmed: isRequestor ? true : exchange.requestorConfirmed,
      providerConfirmed: isProvider ? true : exchange.providerConfirmed
    };
    
    // Si les deux participants ont confirmé, mettre à jour le statut en "completed"
    if (updatedExchange.requestorConfirmed && updatedExchange.providerConfirmed) {
      updatedExchange.status = "completed";
    }
    
    this.exchanges.set(id, updatedExchange);
    return updatedExchange;
  }

  // Messages methods
  async getMessages(senderId: number, receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === senderId && message.receiverId === receiverId) ||
        (message.senderId === receiverId && message.receiverId === senderId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    const newMessage: Message = { 
      ...message, 
      id, 
      read: false, 
      createdAt 
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Reviews methods
  async getReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.revieweeId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const createdAt = new Date();
    const newReview: Review = { ...review, id, createdAt };
    this.reviews.set(id, newReview);
    
    // Update user rating
    const user = await this.getUser(review.revieweeId);
    if (user) {
      const newCount = user.reviewCount + 1;
      const newRating = Math.round(((user.rating * user.reviewCount) + review.rating) / newCount);
      
      await this.updateUser(user.id, {
        rating: newRating,
        reviewCount: newCount
      });
    }
    
    return newReview;
  }

  // Matching
  async findMatches(userId: number): Promise<User[]> {
    const myNeededSkills = await this.getUserNeededSkills(userId);
    const myOfferedSkills = await this.getUserOfferedSkills(userId);
    
    if (myNeededSkills.length === 0 || myOfferedSkills.length === 0) {
      return [];
    }
    
    // Get all users except the current one
    const otherUsers = Array.from(this.users.values())
      .filter(user => user.id !== userId);
    
    const matches: User[] = [];
    
    for (const user of otherUsers) {
      const theirOfferedSkills = await this.getUserOfferedSkills(user.id);
      const theirNeededSkills = await this.getUserNeededSkills(user.id);
      
      // Check if there's a potential match (I need what they offer AND they need what I offer)
      const theyOfferWhatINeed = myNeededSkills.some(myNeed => 
        theirOfferedSkills.some(theirOffer => theirOffer.skillId === myNeed.skillId)
      );
      
      const theyNeedWhatIOffer = myOfferedSkills.some(myOffer => 
        theirNeededSkills.some(theirNeed => theirNeed.skillId === myOffer.skillId)
      );
      
      if (theyOfferWhatINeed && theyNeedWhatIOffer) {
        matches.push(user);
      }
    }
    
    return matches;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      rating: 0,
      reviewCount: 0,
      verified: false,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  // Méthodes d'abonnement
  async updateSubscriptionStatus(userId: number, status: string): Promise<User | undefined> {
    return this.updateUser(userId, { subscriptionStatus: status });
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    return this.updateUser(userId, { stripeCustomerId: customerId });
  }
  
  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
    return this.updateUser(userId, { stripeSubscriptionId: subscriptionId });
  }
  
  async updateSubscriptionExpiresAt(userId: number, expiresAt: Date): Promise<User | undefined> {
    return this.updateUser(userId, { subscriptionExpiresAt: expiresAt });
  }
  
  async incrementMonthlyProposalCount(userId: number): Promise<number> {
    // Récupérer l'utilisateur actuel
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Calculer le nouveau compteur
    const newCount = (user.monthlyProposalCount || 0) + 1;
    
    // Mettre à jour l'utilisateur
    await this.updateUser(userId, { 
      monthlyProposalCount: newCount,
      lastProposalReset: user.lastProposalReset || new Date()
    });
    
    return newCount;
  }
  
  async resetMonthlyProposalCount(userId: number): Promise<void> {
    await this.updateUser(userId, { 
      monthlyProposalCount: 0,
      lastProposalReset: new Date()
    });
  }
  
  async updateUserStripeInfo(userId: number, data: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    return this.updateUser(userId, {
      stripeCustomerId: data.customerId,
      stripeSubscriptionId: data.subscriptionId,
      subscriptionStatus: 'premium'
    });
  }

  // Skill Categories methods
  async getSkillCategories(): Promise<SkillCategory[]> {
    return db.select().from(skillCategories);
  }

  async getSkillCategory(id: number): Promise<SkillCategory | undefined> {
    const result = await db.select()
      .from(skillCategories)
      .where(eq(skillCategories.id, id));
    return result[0];
  }

  async createSkillCategory(category: InsertSkillCategory): Promise<SkillCategory> {
    const result = await db.insert(skillCategories)
      .values(category)
      .returning();
    return result[0];
  }

  // Skills methods
  async getSkills(): Promise<Skill[]> {
    return db.select().from(skills);
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const result = await db.select()
      .from(skills)
      .where(eq(skills.id, id));
    return result[0];
  }

  async getSkillsByCategory(categoryId: number): Promise<Skill[]> {
    return db.select()
      .from(skills)
      .where(eq(skills.categoryId, categoryId));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const result = await db.insert(skills)
      .values(skill)
      .returning();
    return result[0];
  }

  // User Skills methods
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return db.select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
  }

  async getUserOfferedSkills(userId: number): Promise<UserSkill[]> {
    return db.select()
      .from(userSkills)
      .where(and(
        eq(userSkills.userId, userId),
        eq(userSkills.isOffered, true)
      ));
  }

  async getUserNeededSkills(userId: number): Promise<UserSkill[]> {
    return db.select()
      .from(userSkills)
      .where(and(
        eq(userSkills.userId, userId),
        eq(userSkills.isOffered, false)
      ));
  }

  async createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    const result = await db.insert(userSkills)
      .values(userSkill)
      .returning();
    return result[0];
  }

  async updateUserSkill(id: number, data: Partial<UserSkill>): Promise<UserSkill | undefined> {
    const result = await db.update(userSkills)
      .set(data)
      .where(eq(userSkills.id, id))
      .returning();
    return result[0];
  }

  async deleteUserSkill(id: number): Promise<boolean> {
    const result = await db.delete(userSkills)
      .where(eq(userSkills.id, id))
      .returning();
    return result.length > 0;
  }

  // Exchanges methods
  async getExchanges(): Promise<Exchange[]> {
    return db.select().from(exchanges);
  }

  async getExchange(id: number): Promise<Exchange | undefined> {
    const result = await db.select()
      .from(exchanges)
      .where(eq(exchanges.id, id));
    return result[0];
  }

  async getUserExchanges(userId: number): Promise<Exchange[]> {
    return db.select()
      .from(exchanges)
      .where(or(
        eq(exchanges.requestorId, userId),
        eq(exchanges.providerId, userId)
      ));
  }

  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const result = await db.insert(exchanges)
      .values({
        ...exchange,
        status: "pending", 
        createdAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined> {
    const result = await db.update(exchanges)
      .set({ status })
      .where(eq(exchanges.id, id))
      .returning();
    return result[0];
  }
  
  async updateExchangeMethod(id: number, exchangeMethod: string, location?: string, videoLink?: string): Promise<Exchange | undefined> {
    const result = await db.update(exchanges)
      .set({ 
        exchangeMethod,
        location: exchangeMethod === "in-person" ? location : null,
        videoLink: exchangeMethod === "video" ? videoLink : null
      })
      .where(eq(exchanges.id, id))
      .returning();
    return result[0];
  }
  
  async confirmExchangeCompletion(id: number, userId: number): Promise<Exchange | undefined> {
    // D'abord récupérer l'échange
    const [exchange] = await db.select()
      .from(exchanges)
      .where(eq(exchanges.id, id));
      
    if (!exchange) return undefined;
    
    // Vérifier si l'utilisateur est bien participant à l'échange
    const isRequestor = exchange.requestorId === userId;
    const isProvider = exchange.providerId === userId;
    
    if (!isRequestor && !isProvider) return undefined;
    
    const updateData: Partial<Exchange> = {};
    
    if (isRequestor) {
      updateData.requestorConfirmed = true;
    }
    
    if (isProvider) {
      updateData.providerConfirmed = true;
    }
    
    // Mettre à jour l'échange
    const result = await db.update(exchanges)
      .set(updateData)
      .where(eq(exchanges.id, id))
      .returning();
      
    const updatedExchange = result[0];
    
    // Si les deux participants ont confirmé, mettre à jour le statut en "completed"
    if (updatedExchange.requestorConfirmed && updatedExchange.providerConfirmed) {
      return this.updateExchangeStatus(id, "completed");
    }
    
    return updatedExchange;
  }
  
  async updateExchangeMethod(id: number, exchangeMethod: string, location?: string, videoLink?: string): Promise<Exchange | undefined> {
    const result = await db.update(exchanges)
      .set({ 
        exchangeMethod,
        location: exchangeMethod === "in-person" ? location : null,
        videoLink: exchangeMethod === "video" ? videoLink : null
      })
      .where(eq(exchanges.id, id))
      .returning();
    return result[0];
  }
  
  async confirmExchangeCompletion(id: number, userId: number): Promise<Exchange | undefined> {
    // D'abord récupérer l'échange
    const [exchange] = await db.select()
      .from(exchanges)
      .where(eq(exchanges.id, id));
      
    if (!exchange) return undefined;
    
    // Vérifier si l'utilisateur est bien participant à l'échange
    const isRequestor = exchange.requestorId === userId;
    const isProvider = exchange.providerId === userId;
    
    if (!isRequestor && !isProvider) return undefined;
    
    const updateData: Partial<Exchange> = {};
    
    if (isRequestor) {
      updateData.requestorConfirmed = true;
    }
    
    if (isProvider) {
      updateData.providerConfirmed = true;
    }
    
    // Mettre à jour l'échange
    const result = await db.update(exchanges)
      .set(updateData)
      .where(eq(exchanges.id, id))
      .returning();
      
    const updatedExchange = result[0];
    
    // Si les deux participants ont confirmé, mettre à jour le statut en "completed"
    if (updatedExchange.requestorConfirmed && updatedExchange.providerConfirmed) {
      return this.updateExchangeStatus(id, "completed");
    }
    
    return updatedExchange;
  }

  // Messages methods
  async getMessages(senderId: number, receiverId: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(or(
        and(
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId)
        ),
        and(
          eq(messages.senderId, receiverId),
          eq(messages.receiverId, senderId)
        )
      ))
      .orderBy(messages.createdAt);
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      ))
      .orderBy(messages.createdAt, "desc");
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages)
      .values({
        ...message,
        read: false,
        createdAt: new Date()
      })
      .returning();
    return result[0];
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const result = await db.update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  }

  // Reviews methods
  async getReviews(userId: number): Promise<Review[]> {
    return db.select()
      .from(reviews)
      .where(eq(reviews.revieweeId, userId))
      .orderBy(reviews.createdAt, "desc");
  }

  async createReview(review: InsertReview): Promise<Review> {
    // First create the review
    const result = await db.insert(reviews)
      .values({
        ...review,
        createdAt: new Date()
      })
      .returning();
    
    // Then update the user's rating
    const user = await this.getUser(review.revieweeId);
    if (user) {
      const newCount = user.reviewCount + 1;
      const newRating = Math.round(((user.rating * user.reviewCount) + review.rating) / newCount);
      
      await this.updateUser(user.id, {
        rating: newRating,
        reviewCount: newCount
      });
    }
    
    return result[0];
  }

  // Matching
  async findMatches(userId: number): Promise<User[]> {
    // First, get user skills
    const userOfferedSkills = await this.getUserOfferedSkills(userId);
    const userNeededSkills = await this.getUserNeededSkills(userId);
    
    const offeredSkillIds = userOfferedSkills.map(skill => skill.skillId);
    const neededSkillIds = userNeededSkills.map(skill => skill.skillId);
    
    if (offeredSkillIds.length === 0 || neededSkillIds.length === 0) {
      return [];
    }
    
    // Find users who offer what our user needs
    const usersOfferingNeededSkills = await db.select({ user: users })
      .from(users)
      .innerJoin(userSkills, 
        and(
          eq(userSkills.userId, users.id),
          eq(userSkills.isOffered, true),
          inArray(userSkills.skillId, neededSkillIds)
        )
      )
      .where(ne(users.id, userId))
      .groupBy(users.id);
    
    // Find users who need what our user offers
    const usersNeedingOfferedSkills = await db.select({ user: users })
      .from(users)
      .innerJoin(userSkills, 
        and(
          eq(userSkills.userId, users.id),
          eq(userSkills.isOffered, false),
          inArray(userSkills.skillId, offeredSkillIds)
        )
      )
      .where(ne(users.id, userId))
      .groupBy(users.id);
    
    // Find the intersection (users who both offer what we need AND need what we offer)
    const matchingUsers: User[] = [];
    const offeringUserIds = new Set(usersOfferingNeededSkills.map(r => r.user.id));
    
    for (const { user } of usersNeedingOfferedSkills) {
      if (offeringUserIds.has(user.id)) {
        matchingUsers.push(user);
      }
    }
    
    return matchingUsers;
  }
}

// Use database storage
export const storage = new DatabaseStorage();
