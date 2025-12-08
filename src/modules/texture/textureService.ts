import { supabaseService } from '../supabase/supabaseService';
import { TextureModel } from './textureModel';
import path from 'path';

const TABLE = 'textures';
const BUCKET = 'textures';

export const TextureService = {
  async getAll(): Promise<TextureModel[]> {
    return await supabaseService.findAllAdmin<TextureModel>(TABLE);
  },

  async getOne(textureId: string): Promise<TextureModel | undefined> {
    const list = await TextureService.getAll();
    return list.find((t) => t.id === textureId);
  },

  async create(
    body: any,
    files?: {
      alb?: Express.Multer.File;
      nor?: Express.Multer.File;
      orm?: Express.Multer.File;
    }
  ): Promise<TextureModel> {
    const { title: name, object3d_id } = body;

    if (!object3d_id) throw { status: 400, message: 'object3d_id required' };

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
      if (!file) return;

      // safe rename
      const safe = file.originalname?.replace(/\s+/g, '_') || `${prefix}.bin`;

      const ext = path.extname(safe).toLowerCase();
      const filename = `${Date.now()}_${prefix}${ext}`;
      const filepath = `${object3d_id}/${filename}`;

      await supabaseService.uploadObject(
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
      name: name || 'Untitled Texture',
      object3d_id,
      alb_url,
      nor_url,
      orm_url,
    };

    return await supabaseService.insertAdmin<TextureModel>(TABLE, payload);
  },

  async update(
    textureId: string,
    body: Partial<TextureModel>,
    files?: {
      alb?: Express.Multer.File[];
      nor?: Express.Multer.File[];
      orm?: Express.Multer.File[];
    }
  ): Promise<TextureModel> {
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
      const filepath = `${texture_for}/${filename}`;

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

    return await supabaseService.updateByIdAdmin<TextureModel>(
      TABLE,
      textureId,
      changes
    );
  },

  /** DELETE */
  async delete(id: string): Promise<boolean> {
    //delete admin
    const result = await supabaseService.deleteByIdAdmin(TABLE, id);
    return true;
  },
};
