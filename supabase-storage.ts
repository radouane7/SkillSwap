import { users, User, InsertUser, skillCategories, SkillCategory, InsertSkillCategory, 
  skills, Skill, InsertSkill, userSkills, UserSkill, InsertUserSkill, 
  exchanges, Exchange, InsertExchange, messages, Message, InsertMessage,
  reviews, Review, InsertReview, notifications, Notification, InsertNotification } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { IStorage } from "./storage";
import supabase from "./supabase";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// Fonction utilitaire pour convertir les noms de propriétés snake_case en camelCase
function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Si c'est un tableau, convertir chaque élément
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }

  // Sinon, convertir les propriétés de l'objet
  const newObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Convertir snake_case en camelCase
      const camelKey = key.replace(/([-_][a-z])/g, group => 
        group.toUpperCase()
              .replace('-', '')
              .replace('_', '')
      );
      newObj[camelKey] = snakeToCamel(obj[key]);
    }
  }
  return newObj;
}

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true
    });
  }

  // Méthodes des utilisateurs
  async getUser(id: number): Promise<User | undefined> {
    console.log(`Récupération de l'utilisateur avec ID: ${id}`);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return undefined;
    }
    
    if (!data) {
      return undefined;
    }
    
    // Convertir les noms de propriétés snake_case en camelCase
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      bio: data.bio,
      location: data.location,
      profileImage: data.profile_image,
      verified: data.verified,
      rating: data.rating,
      reviewCount: data.review_count,
      subscriptionStatus: data.subscription_status,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      subscriptionExpiresAt: data.subscription_expires_at,
      monthlyProposalCount: data.monthly_proposal_count,
      lastProposalReset: data.last_proposal_reset,
      createdAt: data.created_at,
      firebaseUid: data.firebase_uid,
      provider: data.provider,
      country: data.country,
      city: data.city
    } as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // Code d'erreur quand aucun résultat n'est trouvé
        console.error("Erreur lors de la récupération de l'utilisateur par nom d'utilisateur:", error);
      }
      return undefined;
    }
    
    if (!data) {
      return undefined;
    }
    
    // Convertir les noms de propriétés snake_case en camelCase
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      bio: data.bio,
      location: data.location,
      profileImage: data.profile_image,
      verified: data.verified,
      rating: data.rating,
      reviewCount: data.review_count,
      subscriptionStatus: data.subscription_status,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      subscriptionExpiresAt: data.subscription_expires_at,
      monthlyProposalCount: data.monthly_proposal_count,
      lastProposalReset: data.last_proposal_reset,
      createdAt: data.created_at,
      firebaseUid: data.firebase_uid,
      provider: data.provider,
      country: data.country,
      city: data.city
    } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error("Erreur lors de la récupération de l'utilisateur par email:", error);
      }
      return undefined;
    }
    
    if (!data) {
      return undefined;
    }
    
    // Convertir les noms de propriétés snake_case en camelCase
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      bio: data.bio,
      location: data.location,
      profileImage: data.profile_image,
      verified: data.verified,
      rating: data.rating,
      reviewCount: data.review_count,
      subscriptionStatus: data.subscription_status,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      subscriptionExpiresAt: data.subscription_expires_at,
      monthlyProposalCount: data.monthly_proposal_count,
      lastProposalReset: data.last_proposal_reset,
      createdAt: data.created_at,
      firebaseUid: data.firebase_uid,
      provider: data.provider,
      country: data.country,
      city: data.city
    } as User;
  }
  
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error("Erreur lors de la récupération de l'utilisateur par Firebase UID:", error);
      }
      return undefined;
    }
    
    if (!data) {
      return undefined;
    }
    
    // Convertir les noms de propriétés snake_case en camelCase
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      bio: data.bio,
      location: data.location,
      profileImage: data.profile_image,
      verified: data.verified,
      rating: data.rating,
      reviewCount: data.review_count,
      subscriptionStatus: data.subscription_status,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      subscriptionExpiresAt: data.subscription_expires_at,
      monthlyProposalCount: data.monthly_proposal_count,
      lastProposalReset: data.last_proposal_reset,
      createdAt: data.created_at,
      firebaseUid: data.firebase_uid,
      provider: data.provider,
      country: data.country,
      city: data.city
    } as User;
  }
  
  async linkUserWithFirebase(userId: number, firebaseUid: string, provider: string): Promise<User | undefined> {
    return this.updateUser(userId, { 
      firebaseUid: firebaseUid,
      provider: provider
    });
  }

  async createUser(user: InsertUser): Promise<User> {
    // Convertir de camelCase à snake_case pour Supabase
    const userData = {
      username: user.username,
      email: user.email,
      password: user.password,
      first_name: user.firstName,
      last_name: user.lastName,
      bio: user.bio,
      location: user.location,
      profile_image: user.profileImage,
      country: user.country,
      city: user.city
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("La création de l'utilisateur a échoué");
    }
    
    // Convertir de snake_case à camelCase pour le client
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      bio: data.bio,
      location: data.location,
      profileImage: data.profile_image,
      verified: data.verified,
      rating: data.rating,
      reviewCount: data.review_count,
      subscriptionStatus: data.subscription_status,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      subscriptionExpiresAt: data.subscription_expires_at,
      monthlyProposalCount: data.monthly_proposal_count,
      lastProposalReset: data.last_proposal_reset,
      createdAt: data.created_at,
      firebaseUid: data.firebase_uid,
      provider: data.provider,
      country: data.country,
      city: data.city
    } as User;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Convertir de camelCase à snake_case pour Supabase
    const supabaseData: any = {};
    
    if (userData.firstName !== undefined) supabaseData.first_name = userData.firstName;
    if (userData.lastName !== undefined) supabaseData.last_name = userData.lastName;
    if (userData.profileImage !== undefined) supabaseData.profile_image = userData.profileImage;
    if (userData.subscriptionStatus !== undefined) supabaseData.subscription_status = userData.subscriptionStatus;
    if (userData.stripeCustomerId !== undefined) supabaseData.stripe_customer_id = userData.stripeCustomerId;
    if (userData.stripeSubscriptionId !== undefined) supabaseData.stripe_subscription_id = userData.stripeSubscriptionId;
    if (userData.subscriptionExpiresAt !== undefined) supabaseData.subscription_expires_at = userData.subscriptionExpiresAt;
    if (userData.monthlyProposalCount !== undefined) supabaseData.monthly_proposal_count = userData.monthlyProposalCount;
    if (userData.lastProposalReset !== undefined) supabaseData.last_proposal_reset = userData.lastProposalReset;
    if (userData.firebaseUid !== undefined) supabaseData.firebase_uid = userData.firebaseUid;
    
    // Propriétés qui ont le même nom dans les deux formats
    if (userData.username !== undefined) supabaseData.username = userData.username;
    if (userData.email !== undefined) supabaseData.email = userData.email;
    if (userData.password !== undefined) supabaseData.password = userData.password;
    if (userData.bio !== undefined) supabaseData.bio = userData.bio;
    if (userData.location !== undefined) supabaseData.location = userData.location;
    if (userData.verified !== undefined) supabaseData.verified = userData.verified;
    if (userData.rating !== undefined) supabaseData.rating = userData.rating;
    if (userData.reviewCount !== undefined) supabaseData.review_count = userData.reviewCount;
    if (userData.provider !== undefined) supabaseData.provider = userData.provider;
    if (userData.country !== undefined) supabaseData.country = userData.country;
    if (userData.city !== undefined) supabaseData.city = userData.city;
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      return undefined;
    }
    
    if (!updatedUser) {
      return undefined;
    }
    
    // Convertir de snake_case à camelCase pour le client
    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      password: updatedUser.password,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      bio: updatedUser.bio,
      location: updatedUser.location,
      profileImage: updatedUser.profile_image,
      verified: updatedUser.verified,
      rating: updatedUser.rating,
      reviewCount: updatedUser.review_count,
      subscriptionStatus: updatedUser.subscription_status,
      stripeCustomerId: updatedUser.stripe_customer_id,
      stripeSubscriptionId: updatedUser.stripe_subscription_id,
      subscriptionExpiresAt: updatedUser.subscription_expires_at,
      monthlyProposalCount: updatedUser.monthly_proposal_count,
      lastProposalReset: updatedUser.last_proposal_reset,
      createdAt: updatedUser.created_at,
      firebaseUid: updatedUser.firebase_uid,
      provider: updatedUser.provider,
      country: updatedUser.country,
      city: updatedUser.city
    } as User;
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

  // Méthodes des catégories de compétences
  async getSkillCategories(): Promise<SkillCategory[]> {
    const { data, error } = await supabase
      .from('skill_categories')
      .select('*');
    
    if (error) {
      console.error("Erreur lors de la récupération des catégories de compétences:", error);
      return [];
    }
    
    return data as SkillCategory[];
  }

  async getSkillCategory(id: number): Promise<SkillCategory | undefined> {
    const { data, error } = await supabase
      .from('skill_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erreur lors de la récupération de la catégorie de compétence:", error);
      return undefined;
    }
    
    return data as SkillCategory;
  }

  async createSkillCategory(category: InsertSkillCategory): Promise<SkillCategory> {
    const { data, error } = await supabase
      .from('skill_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création de la catégorie de compétence:", error);
      throw new Error(`Erreur lors de la création de la catégorie: ${error.message}`);
    }
    
    return data as SkillCategory;
  }

  // Méthodes des compétences
  async getSkills(): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*');
    
    if (error) {
      console.error("Erreur lors de la récupération des compétences:", error);
      return [];
    }
    
    return data as Skill[];
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erreur lors de la récupération de la compétence:", error);
      return undefined;
    }
    
    return data as Skill;
  }

  async getSkillsByCategory(categoryId: number): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) {
      console.error("Erreur lors de la récupération des compétences par catégorie:", error);
      return [];
    }
    
    return data as Skill[];
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const { data, error } = await supabase
      .from('skills')
      .insert(skill)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création de la compétence:", error);
      throw new Error(`Erreur lors de la création de la compétence: ${error.message}`);
    }
    
    return data as Skill;
  }

  // Méthodes des compétences utilisateur
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Erreur lors de la récupération des compétences de l'utilisateur:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convertir tous les résultats de snake_case à camelCase
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      skillId: item.skill_id,
      isOffered: item.is_offered,
      experienceLevel: item.experience_level,
      description: item.description
    })) as UserSkill[];
  }

  async getUserOfferedSkills(userId: number): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .eq('is_offered', true);
    
    if (error) {
      console.error("Erreur lors de la récupération des compétences offertes:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convertir tous les résultats de snake_case à camelCase
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      skillId: item.skill_id,
      isOffered: item.is_offered,
      experienceLevel: item.experience_level,
      description: item.description
    })) as UserSkill[];
  }

  async getUserNeededSkills(userId: number): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .eq('is_offered', false);
    
    if (error) {
      console.error("Erreur lors de la récupération des compétences recherchées:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convertir tous les résultats de snake_case à camelCase
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      skillId: item.skill_id,
      isOffered: item.is_offered,
      experienceLevel: item.experience_level,
      description: item.description
    })) as UserSkill[];
  }

  async createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    // Convertir les noms de propriétés en snake_case pour Supabase
    const userSkillData = {
      user_id: userSkill.userId,
      skill_id: userSkill.skillId,
      is_offered: userSkill.isOffered,
      experience_level: userSkill.experienceLevel,
      description: userSkill.description
    };
    
    const { data, error } = await supabase
      .from('user_skills')
      .insert(userSkillData)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création de la compétence utilisateur:", error);
      throw new Error(`Erreur lors de la création de la compétence utilisateur: ${error.message}`);
    }
    
    // Convertir les noms de propriétés de snake_case à camelCase pour le client
    return {
      id: data.id,
      userId: data.user_id,
      skillId: data.skill_id,
      isOffered: data.is_offered,
      experienceLevel: data.experience_level,
      description: data.description
    } as UserSkill;
  }

  async updateUserSkill(id: number, data: Partial<UserSkill>): Promise<UserSkill | undefined> {
    const { data: updatedUserSkill, error } = await supabase
      .from('user_skills')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la mise à jour de la compétence utilisateur:", error);
      return undefined;
    }
    
    return updatedUserSkill as UserSkill;
  }

  async deleteUserSkill(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Erreur lors de la suppression de la compétence utilisateur:", error);
      return false;
    }
    
    return true;
  }

  // Méthodes des échanges
  async getExchanges(): Promise<Exchange[]> {
    const { data, error } = await supabase
      .from('exchanges')
      .select('*');
    
    if (error) {
      console.error("Erreur lors de la récupération des échanges:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convertir tous les résultats de snake_case à camelCase
    return data.map(item => ({
      id: item.id,
      requestorId: item.requestor_id,
      providerId: item.provider_id,
      requestorSkillId: item.requestor_skill_id,
      providerSkillId: item.provider_skill_id,
      status: item.status,
      exchangeMethod: item.exchange_method,
      location: item.location,
      videoLink: item.video_link,
      scheduledDate: item.scheduled_date,
      requestorConfirmed: item.requestor_confirmed,
      providerConfirmed: item.provider_confirmed,
      createdAt: item.created_at
    })) as Exchange[];
  }

  async getExchange(id: number): Promise<Exchange | undefined> {
    const { data, error } = await supabase
      .from('exchanges')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erreur lors de la récupération de l'échange:", error);
      return undefined;
    }
    
    if (!data) {
      return undefined;
    }
    
    // Convertir de snake_case à camelCase
    return {
      id: data.id,
      requestorId: data.requestor_id,
      providerId: data.provider_id,
      requestorSkillId: data.requestor_skill_id,
      providerSkillId: data.provider_skill_id,
      status: data.status,
      exchangeMethod: data.exchange_method,
      location: data.location,
      videoLink: data.video_link,
      scheduledDate: data.scheduled_date,
      requestorConfirmed: data.requestor_confirmed,
      providerConfirmed: data.provider_confirmed,
      createdAt: data.created_at
    } as Exchange;
  }

  async getUserExchanges(userId: number): Promise<Exchange[]> {
    const { data, error } = await supabase
      .from('exchanges')
      .select('*')
      .or(`requestor_id.eq.${userId},provider_id.eq.${userId}`);
    
    if (error) {
      console.error("Erreur lors de la récupération des échanges de l'utilisateur:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convertir tous les résultats de snake_case à camelCase
    return data.map(item => ({
      id: item.id,
      requestorId: item.requestor_id,
      providerId: item.provider_id,
      requestorSkillId: item.requestor_skill_id,
      providerSkillId: item.provider_skill_id,
      status: item.status,
      exchangeMethod: item.exchange_method,
      location: item.location,
      videoLink: item.video_link,
      scheduledDate: item.scheduled_date,
      requestorConfirmed: item.requestor_confirmed,
      providerConfirmed: item.provider_confirmed,
      createdAt: item.created_at
    })) as Exchange[];
  }

  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    // Convertir les noms de propriétés en snake_case pour Supabase
    const newExchange = {
      requestor_id: exchange.requestorId,
      provider_id: exchange.providerId,
      requestor_skill_id: exchange.requestorSkillId,
      provider_skill_id: exchange.providerSkillId,
      status: "pending",
      exchange_method: exchange.exchangeMethod,
      location: exchange.location,
      video_link: exchange.videoLink,
      scheduled_date: exchange.scheduledDate,
      requestor_confirmed: false,
      provider_confirmed: false
    };
    
    const { data, error } = await supabase
      .from('exchanges')
      .insert(newExchange)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création de l'échange:", error);
      throw new Error(`Erreur lors de la création de l'échange: ${error.message}`);
    }
    
    // Convertir les noms de propriétés de snake_case à camelCase pour le client
    return {
      id: data.id,
      requestorId: data.requestor_id,
      providerId: data.provider_id,
      requestorSkillId: data.requestor_skill_id,
      providerSkillId: data.provider_skill_id,
      status: data.status,
      exchangeMethod: data.exchange_method,
      location: data.location,
      videoLink: data.video_link,
      scheduledDate: data.scheduled_date,
      requestorConfirmed: data.requestor_confirmed,
      providerConfirmed: data.provider_confirmed,
      createdAt: data.created_at
    } as Exchange;
  }

  async updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined> {
    const { data, error } = await supabase
      .from('exchanges')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la mise à jour du statut de l'échange:", error);
      return undefined;
    }
    
    return data as Exchange;
  }
  
  async updateExchangeMethod(id: number, exchangeMethod: string, location?: string, videoLink?: string): Promise<Exchange | undefined> {
    const updateData = {
      exchange_method: exchangeMethod,
      location: exchangeMethod === "in-person" ? location : null,
      video_link: exchangeMethod === "video" ? videoLink : null
    };
    
    const { data, error } = await supabase
      .from('exchanges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la mise à jour de la méthode d'échange:", error);
      return undefined;
    }
    
    return data as Exchange;
  }
  
  async confirmExchangeCompletion(id: number, userId: number): Promise<Exchange | undefined> {
    // D'abord récupérer l'échange actuel
    const exchange = await this.getExchange(id);
    if (!exchange) return undefined;
    
    // Vérifier si l'utilisateur est participant à l'échange
    const isRequestor = exchange.requestorId === userId;
    const isProvider = exchange.providerId === userId;
    
    if (!isRequestor && !isProvider) return undefined;
    
    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (isRequestor) {
      updateData.requestor_confirmed = true;
    }
    
    if (isProvider) {
      updateData.provider_confirmed = true;
    }
    
    // Si les deux confirmations seront true après cette mise à jour, mettre à jour le statut également
    if ((isRequestor && exchange.providerConfirmed) || 
        (isProvider && exchange.requestorConfirmed) ||
        (exchange.requestorConfirmed && exchange.providerConfirmed)) {
      updateData.status = "completed";
    }
    
    const { data, error } = await supabase
      .from('exchanges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la confirmation de l'échange:", error);
      return undefined;
    }
    
    return data as Exchange;
  }

  // Méthodes des messages
  async getMessages(senderId: number, receiverId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convertir tous les résultats de snake_case à camelCase
    return data.map(item => ({
      id: item.id,
      senderId: item.sender_id,
      receiverId: item.receiver_id,
      content: item.content,
      read: item.read,
      createdAt: item.created_at
    })) as Message[];
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des messages de l'utilisateur:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convertir tous les résultats de snake_case à camelCase
    return data.map(item => ({
      id: item.id,
      senderId: item.sender_id,
      receiverId: item.receiver_id,
      content: item.content,
      read: item.read,
      createdAt: item.created_at
    })) as Message[];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    // Convertir les noms de propriétés en snake_case pour Supabase
    const messageData = {
      sender_id: message.senderId,
      receiver_id: message.receiverId,
      content: message.content,
      read: false
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création du message:", error);
      throw new Error(`Erreur lors de la création du message: ${error.message}`);
    }
    
    // Convertir les noms de propriétés de snake_case à camelCase pour le client
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      read: data.read,
      createdAt: data.created_at
    } as Message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors du marquage du message comme lu:", error);
      return undefined;
    }
    
    return data as Message;
  }

  // Méthodes des avis
  async getReviews(userId: number): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des avis:", error);
      return [];
    }
    
    return data as Review[];
  }

  async createReview(review: InsertReview): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création de l'avis:", error);
      throw new Error(`Erreur lors de la création de l'avis: ${error.message}`);
    }
    
    return data as Review;
  }

  // Méthodes de matching
  async findMatches(userId: number): Promise<User[]> {
    // Cette méthode est complexe et nécessite une logique plus avancée
    // Pour l'instant, nous utilisons une requête SQL directe via la fonction RPC
    const { data, error } = await supabase.rpc('find_matches', { input_user_id: userId });
    
    if (error) {
      console.error("Erreur lors de la recherche de matchs:", error);
      return [];
    }
    
    // Convertir de snake_case à camelCase pour le client
    return data.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      location: user.location,
      profileImage: user.profile_image,
      verified: user.verified,
      rating: user.rating,
      reviewCount: user.review_count,
      subscriptionStatus: user.subscription_status,
      stripeCustomerId: user.stripe_customer_id,
      stripeSubscriptionId: user.stripe_subscription_id,
      subscriptionExpiresAt: user.subscription_expires_at,
      monthlyProposalCount: user.monthly_proposal_count,
      lastProposalReset: user.last_proposal_reset,
      createdAt: user.created_at,
      firebaseUid: user.firebase_uid,
      provider: user.provider,
      country: user.country,
      city: user.city
    })) as User[];
  }

  async findUsersWhoNeedMySkills(userId: number): Promise<User[]> {
    console.log(`[/api/users-who-need-my-skills] Recherche pour userId=${userId}`);
    
    // Récupérer les compétences offertes par l'utilisateur
    const myOfferedSkills = await this.getUserOfferedSkills(userId);
    const skillIds = myOfferedSkills.map(skill => skill.skillId);
    
    if (skillIds.length === 0) {
      console.log("[/api/users-who-need-my-skills] Aucune compétence offerte par l'utilisateur");
      return [];
    }
    
    // Trouver les utilisateurs qui recherchent ces compétences
    const { data, error } = await supabase
      .from('user_skills')
      .select('user_id')
      .eq('is_offered', false)
      .in('skill_id', skillIds)
      .neq('user_id', userId);
    
    if (error) {
      console.error("Erreur lors de la recherche des utilisateurs qui ont besoin de mes compétences:", error);
      return [];
    }
    
    // Extraire les IDs d'utilisateurs uniques sans utiliser la syntaxe spread
    const userIds = Array.from(new Set(data.map(us => us.user_id)));
    
    console.log(`[/api/users-who-need-my-skills] Nombre d'utilisateurs trouvés: ${userIds.length}`);
    
    if (userIds.length === 0) {
      return [];
    }
    
    // Récupérer les détails des utilisateurs trouvés
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);
    
    if (usersError) {
      console.error("Erreur lors de la récupération des détails des utilisateurs:", usersError);
      return [];
    }
    
    if (!users || users.length === 0) {
      return [];
    }
    
    // Analyser chaque utilisateur pour les logs
    for (const user of users) {
      // Compter les compétences offertes
      const { data: offeredSkills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_offered', true);
      
      if (offeredSkills) {
        console.log(`[/api/users-who-need-my-skills] User ${user.id} a ${offeredSkills.length} compétences offertes`);
      }
      
      // Compter les compétences recherchées
      const { data: neededSkills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_offered', false);
      
      if (neededSkills) {
        console.log(`[/api/users-who-need-my-skills] User ${user.id} a ${neededSkills.length} compétences recherchées`);
      }
    }
    
    // Convertir les utilisateurs de snake_case à camelCase
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      location: user.location,
      profileImage: user.profile_image,
      verified: user.verified,
      rating: user.rating,
      reviewCount: user.review_count,
      subscriptionStatus: user.subscription_status,
      stripeCustomerId: user.stripe_customer_id,
      stripeSubscriptionId: user.stripe_subscription_id,
      subscriptionExpiresAt: user.subscription_expires_at,
      monthlyProposalCount: user.monthly_proposal_count,
      lastProposalReset: user.last_proposal_reset,
      createdAt: user.created_at,
      firebaseUid: user.firebase_uid,
      provider: user.provider,
      country: user.country,
      city: user.city
    }));
    
    console.log(`[/api/users-who-need-my-skills] Envoi de ${transformedUsers.length} utilisateurs`);
    return transformedUsers as User[];
  }

  async findUsersWhoOfferSkillsINeed(userId: number): Promise<User[]> {
    // Récupérer les compétences recherchées par l'utilisateur
    const myNeededSkills = await this.getUserNeededSkills(userId);
    const skillIds = myNeededSkills.map(skill => skill.skillId);
    
    if (skillIds.length === 0) {
      return [];
    }
    
    // Trouver les utilisateurs qui offrent ces compétences
    const { data, error } = await supabase
      .from('user_skills')
      .select('user_id')
      .eq('is_offered', true)
      .in('skill_id', skillIds)
      .neq('user_id', userId);
    
    if (error) {
      console.error("Erreur lors de la recherche des utilisateurs qui offrent les compétences dont j'ai besoin:", error);
      return [];
    }
    
    // Extraire les IDs d'utilisateurs uniques sans utiliser la syntaxe spread
    const userIds = Array.from(new Set(data.map(us => us.user_id)));
    
    if (userIds.length === 0) {
      return [];
    }
    
    // Récupérer les détails des utilisateurs trouvés
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);
    
    if (usersError) {
      console.error("Erreur lors de la récupération des détails des utilisateurs:", usersError);
      return [];
    }
    
    if (!users || users.length === 0) {
      return [];
    }
    
    // Convertir les utilisateurs de snake_case à camelCase
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      location: user.location,
      profileImage: user.profile_image,
      verified: user.verified,
      rating: user.rating,
      reviewCount: user.review_count,
      subscriptionStatus: user.subscription_status,
      stripeCustomerId: user.stripe_customer_id,
      stripeSubscriptionId: user.stripe_subscription_id,
      subscriptionExpiresAt: user.subscription_expires_at,
      monthlyProposalCount: user.monthly_proposal_count,
      lastProposalReset: user.last_proposal_reset,
      createdAt: user.created_at,
      firebaseUid: user.firebase_uid,
      provider: user.provider,
      country: user.country,
      city: user.city
    }));
    
    return transformedUsers as User[];
  }

  // Méthodes des notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convertir tous les résultats de snake_case à camelCase
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      message: item.message,
      type: item.type,
      read: item.read,
      title: item.title,
      linkUrl: item.link_url,
      relatedUserId: item.related_user_id,
      relatedItemId: item.related_item_id,
      createdAt: item.created_at
    })) as Notification[];
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error("Erreur lors du comptage des notifications non lues:", error);
      return 0;
    }
    
    return count || 0;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    // Convertir de camelCase à snake_case pour Supabase
    const notificationData = {
      user_id: notification.userId,
      message: notification.message,
      type: notification.type,
      read: notification.read || false,
      title: notification.title,
      link_url: notification.linkUrl,
      related_user_id: notification.relatedUserId,
      related_item_id: notification.relatedItemId
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de la création de la notification:", error);
      throw new Error(`Erreur lors de la création de la notification: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("La création de la notification a échoué");
    }
    
    // Convertir de snake_case à camelCase pour le client
    return {
      id: data.id,
      userId: data.user_id,
      message: data.message,
      type: data.type,
      read: data.read,
      title: data.title,
      linkUrl: data.link_url,
      relatedUserId: data.related_user_id,
      relatedItemId: data.related_item_id,
      createdAt: data.created_at
    } as Notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors du marquage de la notification comme lue:", error);
      return undefined;
    }
    
    if (!data) {
      return undefined;
    }
    
    // Convertir de snake_case à camelCase pour le client
    return {
      id: data.id,
      userId: data.user_id,
      message: data.message,
      type: data.type,
      read: data.read,
      title: data.title,
      linkUrl: data.link_url,
      relatedUserId: data.related_user_id,
      relatedItemId: data.related_item_id,
      createdAt: data.created_at
    } as Notification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
    }
  }
}

// Créer et exporter une instance de SupabaseStorage
export const supabaseStorage = new SupabaseStorage();