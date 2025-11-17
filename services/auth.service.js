// services/auth.service.js
import { supabaseAdmin, supabasePublic } from '../config/supabase.js';

/**
 * ============================
 *  SIGNUP — Admin tạo tài khoản
 *  (bỏ qua RLS, dùng service role)
 * ============================
 */
export async function signup({ email, password }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data; // { user }
}

/**
 * ============================
 *  LOGIN — User đăng nhập
 *  (bắt buộc dùng ANON client)
 * ============================
 */
export async function login({ email, password }) {
  const { data, error } = await supabasePublic.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data; // { user, session }
}

/**
 * ============================
 *  REFRESH TOKEN
 *  (dùng ANON client, giống login)
 * ============================
 */
export async function refresh({ refresh_token }) {
  const { data, error } = await supabasePublic.auth.refreshSession({
    refresh_token,
  });
  if (error) throw error;
  return data; // { session, user }
}

/**
 * ============================
 *  LOGOUT — revoke access token
 *  (dùng Service Role)
 * ============================
 */
export async function logout(accessToken) {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
  if (error) throw error;
  return { ok: true };
}
