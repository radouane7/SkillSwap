-- Script de création des tables pour Supabase avec les conventions de nommage snake_case
-- À exécuter manuellement dans la console SQL de Supabase

BEGIN;

-- Table 1: Utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT,            -- Snake case au lieu de firstName
  last_name TEXT,             -- Snake case au lieu de lastName
  bio TEXT,
  location TEXT,
  country TEXT,
  city TEXT,
  profile_image TEXT,         -- Snake case au lieu de profileImage
  verified BOOLEAN DEFAULT FALSE,
  rating FLOAT DEFAULT 0,
  review_count INTEGER DEFAULT 0,  -- Snake case au lieu de reviewCount
  subscription_status TEXT DEFAULT 'free',  -- Snake case
  stripe_customer_id TEXT,    -- Snake case
  stripe_subscription_id TEXT, -- Snake case
  subscription_expires_at TIMESTAMP,  -- Snake case
  monthly_proposal_count INTEGER DEFAULT 0,  -- Snake case
  last_proposal_reset TIMESTAMP,  -- Snake case
  created_at TIMESTAMP DEFAULT NOW(),  -- Snake case
  firebase_uid TEXT,          -- Snake case
  provider TEXT
);

-- Table 2: Catégories de compétences
CREATE TABLE IF NOT EXISTS skill_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color_class TEXT            -- Snake case au lieu de colorClass
);

-- Table 3: Compétences
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES skill_categories(id),  -- Snake case
  description TEXT
);

-- Table 4: Compétences des utilisateurs
CREATE TABLE IF NOT EXISTS user_skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),  -- Snake case
  skill_id INTEGER NOT NULL REFERENCES skills(id), -- Snake case
  is_offered BOOLEAN NOT NULL,  -- Snake case
  experience_level TEXT NOT NULL,  -- Snake case
  description TEXT
);

-- Table 5: Échanges
CREATE TABLE IF NOT EXISTS exchanges (
  id SERIAL PRIMARY KEY,
  requestor_id INTEGER NOT NULL REFERENCES users(id),  -- Snake case
  provider_id INTEGER NOT NULL REFERENCES users(id),   -- Snake case
  requestor_skill_id INTEGER NOT NULL REFERENCES skills(id),  -- Snake case
  provider_skill_id INTEGER NOT NULL REFERENCES skills(id),   -- Snake case
  status TEXT NOT NULL,
  exchange_method TEXT,       -- Snake case
  location TEXT,
  video_link TEXT,           -- Snake case
  requestor_confirmed BOOLEAN,  -- Snake case
  provider_confirmed BOOLEAN,   -- Snake case
  scheduled_date TIMESTAMP,     -- Snake case
  created_at TIMESTAMP DEFAULT NOW()  -- Snake case
);

-- Table 6: Messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id),    -- Snake case
  receiver_id INTEGER NOT NULL REFERENCES users(id),  -- Snake case
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()  -- Snake case
);

-- Table 7: Avis
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  exchange_id INTEGER NOT NULL REFERENCES exchanges(id),  -- Snake case
  reviewer_id INTEGER NOT NULL REFERENCES users(id),      -- Snake case
  reviewee_id INTEGER NOT NULL REFERENCES users(id),      -- Snake case
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()  -- Snake case
);

-- Table 8: Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),  -- Snake case
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link_url TEXT,              -- Snake case
  related_user_id INTEGER REFERENCES users(id),  -- Snake case
  related_item_id INTEGER,    -- Snake case
  created_at TIMESTAMP DEFAULT NOW()  -- Snake case
);

COMMIT;