-- Script de création des tables pour Supabase
-- À exécuter manuellement dans la console SQL de Supabase

BEGIN;

-- Table 1: Utilisateurs
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

-- Table 2: Catégories de compétences
CREATE TABLE IF NOT EXISTS skill_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  colorClass TEXT
);

-- Table 3: Compétences
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  categoryId INTEGER NOT NULL REFERENCES skill_categories(id),
  description TEXT
);

-- Table 4: Compétences des utilisateurs
CREATE TABLE IF NOT EXISTS user_skills (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id),
  skillId INTEGER NOT NULL REFERENCES skills(id),
  isOffered BOOLEAN NOT NULL,
  experienceLevel TEXT NOT NULL,
  description TEXT
);

-- Table 5: Échanges
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

-- Table 6: Messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  senderId INTEGER NOT NULL REFERENCES users(id),
  receiverId INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Table 7: Avis
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  exchangeId INTEGER NOT NULL REFERENCES exchanges(id),
  reviewerId INTEGER NOT NULL REFERENCES users(id),
  revieweeId INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Table 8: Notifications
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

COMMIT;