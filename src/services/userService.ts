import { supabaseAdmin } from '../config/supabase';

export interface UserPayload {
  name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  [key: string]: any;
}

export const userService = {
  /**
   * Get all users with pagination
   */
  async getAll(page: number = 1, pageSize: number = 20) {
    const p = Number(page);
    const ps = Number(pageSize);

    const from = (p - 1) * ps;
    const to = from + ps - 1;

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .range(from, to)
      .order('id', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get user by ID
   */
  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Create new user
   */
  async create(payload: UserPayload) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user
   */
  async update(id: string, patch: UserPayload) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a user
   */
  async remove(id: string) {
    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

    if (error) throw error;
    return { ok: true };
  },
};
