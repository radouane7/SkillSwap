import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import ws from 'ws';

// Configurer dotenv
config();

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erreur: Les variables d\'environnement SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY ne sont pas définies.');
  process.exit(1);
}

// Configuration pour les environnements Node.js - nécessaire pour Replit
const supabaseOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: fetch.bind(globalThis),
    headers: { "X-Client-Info": "supabase-js/2.0.0" },
  },
};

// Ajouter le constructeur WebSocket pour les environnements Node.js
if (typeof window === 'undefined') {
  // @ts-ignore - Ces propriétés sont nécessaires mais TypeScript ne les connaît pas
  supabaseOptions.global.Headers = globalThis.Headers;
  // @ts-ignore
  supabaseOptions.global.Request = globalThis.Request;
  // @ts-ignore
  supabaseOptions.global.Response = globalThis.Response;
  supabaseOptions.global.fetch = fetch.bind(globalThis);
  // @ts-ignore
  supabaseOptions.realtime = {
    websocket: ws
  };
}

// Créer et exporter le client Supabase 
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseOptions
);

export default supabase;