import 'dotenv/config';

export const config: Record<string, any> = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  supabaseUrl: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRole:
    process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY,
};

['supabaseUrl', 'anonKey', 'serviceRole'].forEach((key) => {
  if (!config[key]) {
    console.warn(`[config] Missing ${key}. Did you create a .env file?`);
  }
});
