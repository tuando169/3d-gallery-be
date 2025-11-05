import { supabaseAdmin } from '../config/supabase.js';

export async function signup({ email, password }) {
  const { data, error } = await supabaseAdmin.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function login({ email, password }) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data; // { session, user }
}

export async function refresh({ refresh_token }) {
  const { data, error } = await supabaseAdmin.auth.refreshSession({
    refresh_token,
  });
  if (error) throw error;
  return data;
}

export async function logout(accessToken) {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
  if (error) throw error;
  return { ok: true };
}
