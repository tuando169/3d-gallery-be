import { SupabaseClient } from '@supabase/supabase-js';
import { getUserClient, supabaseAdmin } from '../config/supabase';

const byToken = (token: string): SupabaseClient => getUserClient(token);

export const supabaseService = {
  /* ============================================================
   *  ADMIN MODE — Bỏ RLS
   * ============================================================ */
  async findAllAdmin<T = any>(
    table: string,
    select: string = '*',
    queryBuilder: (q: any) => any = (q) => q
  ): Promise<T[]> {
    let q = supabaseAdmin.from(table).select(select);
    q = queryBuilder(q);

    const { data, error } = await q;
    if (error) throw error;

    return data as T[];
  },

  /* ============================================================
   *  RLS MODE — Lấy danh sách theo user token
   * ============================================================ */
  async findMany<T = any>(
    token: string,
    table: string,
    select: string = '*',
    queryBuilder: (q: any) => any = (q) => q
  ): Promise<T[]> {
    const db = byToken(token);

    let q = db.from(table).select(select);
    q = queryBuilder(q);

    const { data, error } = await q;
    if (error) throw error;

    return data as T[];
  },

  /* ============================================================
   *  CREATE
   * ============================================================ */
  async create<T = any>(
    token: string,
    table: string,
    payload: Partial<T>
  ): Promise<T> {
    const db = byToken(token);

    const { data, error } = await db
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  },

  /* ============================================================
   *  FIND BY ID
   * ============================================================ */
  async findById<T = any>(
    token: string,
    table: string,
    id: number | string
  ): Promise<T | null> {
    const db = byToken(token);

    const { data, error } = await db
      .from(table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  },

  /* ============================================================
   *  UPDATE BY ID
   * ============================================================ */
  async updateById<T = any>(
    token: string,
    table: string,
    id: number | string,
    patch: Partial<T>
  ): Promise<T> {
    const db = byToken(token);

    const { data, error } = await db
      .from(table)
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  },

  /* ============================================================
   *  DELETE BY ID
   * ============================================================ */
  async deleteById(
    token: string,
    table: string,
    id: number | string
  ): Promise<{ ok: true }> {
    const db = byToken(token);

    const { error } = await db.from(table).delete().eq('id', id);
    if (error) throw error;

    return { ok: true };
  },

  /* ============================================================
   *  STORAGE
   * ============================================================ */
  async bucketExists(bucket: string): Promise<boolean> {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) throw error;

    return buckets?.some((b) => b.name === bucket) ?? false;
  },

  async getBucketInfo(bucket: string): Promise<Record<string, any> | null> {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) throw error;

    return buckets?.find((b) => b.name === bucket) ?? null;
  },

  async uploadObject(
    bucket: string,
    path: string,
    fileBuffer: Buffer,
    contentType: string,
    upsert: boolean = false
  ) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, fileBuffer, { contentType, upsert });

    if (error) throw error;
    return data;
  },

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async createSignedUrl(
    bucket: string,
    path: string,
    expiresInSec: number = 60 * 60 * 24 * 30
  ): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSec);

    if (error) throw error;
    return data.signedUrl;
  },
};
