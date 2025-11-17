// config/supabase.js
import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

/**
 * =======================================
 * 1. SUPABASE ADMIN CLIENT (SERVICE ROLE)
 * - Bypass RLS
 * - CRUD full quyền
 * - Upload Storage
 * - Admin signOut(), createUser()
 * =======================================
 */
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.serviceRole,
  {
    auth: { persistSession: false },
  }
);

/**
 * =======================================
 * 2. USER CLIENT
 * Truy vấn với quyền user dựa trên accessToken
 * (Dùng cho RLS)
 * =======================================
 */
export const getUserClient = (accessToken = '') => {
  return createClient(config.supabaseUrl, config.anonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: { persistSession: false },
  });
};

/**
 * =======================================
 * 3. PUBLIC CLIENT
 * Dùng login/refresh session từ backend
 * =======================================
 */
export const supabasePublic = createClient(config.supabaseUrl, config.anonKey, {
  auth: { persistSession: false },
});

/**
 * =======================================
 * 4. Helper: Lấy user từ Bearer token
 * (Dùng trong middleware / controller)
 * =======================================
 */
export const getUserFromRequest = async (req) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ')
    ? auth.slice('Bearer '.length)
    : null;

  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return null;

  return data.user; // { id, email, ... }
};
