import { supabaseService } from '../supabase/supabaseService';
import { TextureModel } from './textureModel';
import path from 'path';

const TABLE = 'textures';
const BUCKET = 'textures';

export const TextureService = {
  async getAll(token: string): Promise<TextureModel[]> {
    return await supabaseService.findMany(token, TABLE, '*', (q) => q);
  },

  async getOne(
    token: string,
    textureId: string
  ): Promise<TextureModel | undefined> {
    return await supabaseService.findById(token, TABLE, textureId);
  },

  async create(
    token: string,
    body: any,
    files?: {
      alb?: Express.Multer.File;
      nor?: Express.Multer.File;
      orm?: Express.Multer.File;
    }
  ): Promise<TextureModel> {
    const { title, texture_for } = body;
    const owner_id = body.owner_id || null;

    if (!owner_id) throw { status: 400, message: 'owner_id required' };
    if (!texture_for) throw { status: 400, message: 'object3d_id required' };

    const fileAlb = files?.alb;
    const fileNor = files?.nor;
    const fileOrm = files?.orm;

    const hasAnyFile = fileAlb || fileNor || fileOrm;
    const hasAnyUrl = body.alb_url || body.nor_url || body.orm_url;

    if (!hasAnyFile && !hasAnyUrl) {
      throw { status: 400, message: 'Provide alb/nor/orm or *_url' };
    }

    const bucketExists = await supabaseService.bucketExists(BUCKET);
    if (!bucketExists)
      throw { status: 400, message: `Bucket "${BUCKET}" missing.` };

    const meta = await supabaseService.getBucketInfo(BUCKET);
    const isPublicBucket = !!meta?.public;

    const uploadOne = async (
      file: Express.Multer.File | undefined,
      prefix: string
    ) => {
      if (!file) return null;

      const safe = file.originalname.replace(/\s+/g, '_');
      const ext = path.extname(safe).toLowerCase();
      const filename = `${Date.now()}_${prefix}${ext}`;
      const filepath = `${owner_id}/${texture_for}/${filename}`;

      const up = await supabaseService.uploadObject(
        BUCKET,
        filepath,
        file.buffer,
        file.mimetype,
        true
      );

      return isPublicBucket
        ? supabaseService.getPublicUrl(BUCKET, filepath)
        : await supabaseService.createSignedUrl(BUCKET, filepath);
    };

    const alb_url = body.alb_url || (await uploadOne(fileAlb, 'alb'));
    const nor_url = body.nor_url || (await uploadOne(fileNor, 'nor'));
    const orm_url = body.orm_url || (await uploadOne(fileOrm, 'orm'));

    const payload: Partial<TextureModel> = {
      name: title || 'Untitled Texture',
      owner_id,
      object3d_id: texture_for,
      alb_url,
      nor_url,
      orm_url,
    };

    return await supabaseService.create<TextureModel>(token, TABLE, payload);
  },

  async update(
    token: string,
    textureId: string,
    body: Partial<TextureModel>,
    files?: {
      alb?: Express.Multer.File[];
      nor?: Express.Multer.File[];
      orm?: Express.Multer.File[];
    }
  ): Promise<TextureModel> {
    const owner_id = body.owner_id;
    const texture_for = body.object3d_id;

    const fileAlb = files?.alb?.[0];
    const fileNor = files?.nor?.[0];
    const fileOrm = files?.orm?.[0];

    const bucketExists = await supabaseService.bucketExists(BUCKET);
    if (!bucketExists)
      throw { status: 400, message: `Bucket "${BUCKET}" missing.` };

    const meta = await supabaseService.getBucketInfo(BUCKET);
    const isPublicBucket = !!meta?.public;

    const uploadOne = async (
      file: Express.Multer.File | undefined,
      prefix: string
    ) => {
      if (!file) return undefined;

      const safe = file.originalname.replace(/\s+/g, '_');
      const ext = path.extname(safe).toLowerCase();
      const filename = `${Date.now()}_${prefix}${ext}`;
      const filepath = `${owner_id}/${texture_for}/${filename}`;

      const up = await supabaseService.uploadObject(
        BUCKET,
        filepath,
        file.buffer,
        file.mimetype,
        true
      );

      return isPublicBucket
        ? supabaseService.getPublicUrl(BUCKET, filepath)
        : await supabaseService.createSignedUrl(BUCKET, filepath);
    };

    const changes: Partial<TextureModel> = {
      name: body.name,
      alb_url: body.alb_url,
      nor_url: body.nor_url,
      orm_url: body.orm_url,
    };

    if (fileAlb) changes.alb_url = await uploadOne(fileAlb, 'alb');
    if (fileNor) changes.nor_url = await uploadOne(fileNor, 'nor');
    if (fileOrm) changes.orm_url = await uploadOne(fileOrm, 'orm');

    return await supabaseService.updateById<TextureModel>(
      token,
      TABLE,
      textureId,
      changes
    );
  },

  /** DELETE */
  async delete(token: string, id: string): Promise<boolean> {
    await supabaseService.deleteById(token, TABLE, id);

    return true;
  },
};
