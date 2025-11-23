import { getUserClient, supabaseAdmin } from '../config/supabase.js';

const byToken = (token) => getUserClient(token);

// Lấy tất cả item, bỏ qua RLS (dùng service role)
export const allItems = async (
  table,
  select = '*',
  queryBuilder = (q) => q
) => {
  let q = supabaseAdmin.from(table).select(select);
  q = queryBuilder(q);
  const { data, error } = await q;
  if (error) throw error;
  return data;
};

/* ==================== BASIC CRUD (RLS qua user token) ==================== */
export const listItems = async (
  token,
  table,
  select = '*',
  queryBuilder = (q) => q
) => {
  const db = byToken(token);
  let q = db.from(table).select(select);
  q = queryBuilder(q);
  const { data, error } = await q;
  if (error) throw error;
  return data;
};

export const insertItem = async (token, table, payload) => {
  const db = byToken(token);
  const { data, error } = await db
    .from(table)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getById = async (token, table, id) => {
  const db = byToken(token);
  const { data, error } = await db
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateById = async (token, table, id, patch) => {
  const db = byToken(token);
  const { data, error } = await db
    .from(table)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteById = async (token, table, id) => {
  const db = byToken(token);
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) throw error;
  return { ok: true };
};

/* ==================== STORAGE HELPERS (Service role) ==================== */
// Chỉ kiểm tra tồn tại bucket, KHÔNG tự động đổi public/private để tránh phá config của bạn
export const ensureBucketExists = async (bucket) => {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw error;
  return buckets?.some((b) => b.name === bucket);
};

export const getBucketMeta = async (bucket) => {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw error;
  return buckets?.find((b) => b.name === bucket) ?? null; // { id, name, public, ... }
};

export const uploadToBucket = async (
  bucket,
  path,
  fileBuffer,
  contentType,
  upsert = false
) => {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, fileBuffer, { contentType, upsert });
  if (error) throw error;
  return data; // { path, ... }
};

export const getPublicUrl = (bucket, path) => {
  // Trả về URL public (chỉ truy cập được nếu bucket Public)
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const createSignedUrl = async (
  bucket,
  path,
  expiresInSec = 60 * 60 * 24 * 30
) => {
  // Dùng cho bucket Private: URL có hạn
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSec);
  if (error) throw error;
  return data.signedUrl;
};
