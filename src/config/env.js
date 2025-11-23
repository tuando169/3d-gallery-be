// config/env.js
import 'dotenv/config';

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 4000,

  supabaseUrl: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,

  // accept either var name
  serviceRole: process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// sanity warnings
['supabaseUrl', 'anonKey', 'serviceRole'].forEach((key) => {
  if (!config[key]) {
    console.warn(`[config] Missing ${key}. Did you create a .env file?`);
  }
});
