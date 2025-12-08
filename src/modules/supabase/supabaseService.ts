import { SupabaseClient } from '@supabase/supabase-js';
import { getUserClient, supabaseAdmin } from '../../config/supabase';

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
    if (error) {
      console.log(error);

      throw error;
    }

    return data as T[];
  },

  /** Get single row by id (admin bypass) */
  async findByIdAdmin<T = any>(
    table: string,
    id: string,
    select = '*'
  ): Promise<T | null> {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select(select)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.log(error);

      throw error;
    }
    return data as T | null;
  },

  /** Insert record (admin bypass) */
  async insertAdmin<T = any>(table: string, payload: object): Promise<T> {
    const { data, error } = await supabaseAdmin
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.log(error);

      throw error;
    }
    return data as T;
  },

  /** Update record by ID (admin bypass) */
  async updateByIdAdmin<T = any>(
    table: string,
    id: string,
    updateFields: object
  ): Promise<T> {
    const { data, error } = await supabaseAdmin
      .from(table)
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.log(error);

      throw error;
    }
    return data as T;
  },

  /** Delete record by ID (admin bypass) */
  async deleteByIdAdmin(table: string, id: string): Promise<void> {
    const { error } = await supabaseAdmin.from(table).delete().eq('id', id);

    if (error) {
      console.log(error);

      throw error;
    }
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
    if (error) {
      console.log(error);

      throw error;
    }

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

    if (error) {
      console.log(error);

      throw error;
    }
    return data;
  },

  /* ============================================================
   *  FIND BY ID
   * ============================================================ */
  async findById<T = any>(
    token: string,
    table: string,
    id: number | string
  ): Promise<T | undefined> {
    const db = byToken(token);

    const { data, error } = await db
      .from(table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.log(error);

      throw error;
    }
    return data;
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

    if (error) {
      console.log(error);

      throw error;
    }
    return data as T;
  },

  /* ============================================================
   *  DELETE BY ID
   * ============================================================ */
  async deleteById(
    token: string,
    table: string,
    id: number | string
  ): Promise<boolean> {
    const db = byToken(token);

    const { error } = await db.from(table).delete().eq('id', id);
    if (error) {
      console.log(error);

      throw error;
    }

    return true;
  },

  /* ============================================================
   *  STORAGE
   * ============================================================ */
  async bucketExists(bucket: string): Promise<boolean> {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
      console.log(error);

      throw error;
    }

    return buckets?.some((b) => b.name === bucket) ?? false;
  },

  async getBucketInfo(bucket: string): Promise<Record<string, any> | null> {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
      console.log(error);

      throw error;
    }

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

    if (error) {
      console.log(error);

      throw error;
    }
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

    if (error) {
      console.log(error);

      throw error;
    }
    return data.signedUrl;
  },
};
