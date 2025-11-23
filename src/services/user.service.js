// services/user.service.js
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Lấy danh sách user (có phân trang)
 */
export const getAllUsers = async (page = 1, pageSize = 20) => {
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
};

/**
 * Lấy user theo ID
 */
export const getUserById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Tạo user mới
 */
export const createUser = async (payload) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Cập nhật user
 */
export const updateUser = async (id, patch) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Xoá user
 */
export const deleteUser = async (id) => {
  const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

  if (error) throw error;
  return { ok: true };
};
