-- Script de création des tables pour Supabase
-- Correspond exactement au schéma PostgreSQL local
-- À exécuter manuellement dans la console SQL de Supabase

BEGIN;

-- Table 1: Utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  location TEXT,
  profile_image TEXT,
  verified BOOLEAN DEFAULT FALSE,
  rating INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  subscription_status TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_expires_at TIMESTAMP,
  monthly_proposal_count INTEGER DEFAULT 0,
  last_proposal_reset TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  firebase_uid TEXT UNIQUE,
  provider TEXT,
  country TEXT,
  city TEXT
);

-- Table 2: Catégories de compétences
CREATE TABLE IF NOT EXISTS skill_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color_class TEXT NOT NULL
);

-- Table 3: Compétences
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES skill_categories(id),
  description TEXT
);

-- Table 4: Compétences des utilisateurs
CREATE TABLE IF NOT EXISTS user_skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  is_offered BOOLEAN NOT NULL,
  experience_level TEXT NOT NULL,
  description TEXT
);

-- Table 5: Échanges
CREATE TABLE IF NOT EXISTS exchanges (
  id SERIAL PRIMARY KEY,
  requestor_id INTEGER NOT NULL REFERENCES users(id),
  provider_id INTEGER NOT NULL REFERENCES users(id),
  requestor_skill_id INTEGER NOT NULL REFERENCES skills(id),
  provider_skill_id INTEGER NOT NULL REFERENCES skills(id),
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  exchange_method TEXT,
  location TEXT,
  video_link TEXT,
  requestor_confirmed BOOLEAN DEFAULT FALSE,
  provider_confirmed BOOLEAN DEFAULT FALSE
);

-- Table 6: Messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 7: Avis
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  exchange_id INTEGER NOT NULL REFERENCES exchanges(id),
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  reviewee_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 8: Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  related_user_id INTEGER REFERENCES users(id),
  related_item_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMIT;