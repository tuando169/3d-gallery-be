// config/supabase.js
import { createClient } from '@supabase/supabase-js';
import { config } from './env';
import { Request } from 'express';

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
