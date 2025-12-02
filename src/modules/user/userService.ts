import { supabaseAdmin } from '../../config/supabase';
import { UserModel } from './userModel';

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
  async getAll(): Promise<UserModel[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<UserModel | undefined> {
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
  async create(payload: UserPayload): Promise<UserModel> {
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
  async update(id: string, patch: UserPayload): Promise<UserModel> {
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
  async remove(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

    if (error) throw error;
    return true;
  },
};
