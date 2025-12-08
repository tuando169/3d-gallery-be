import axios from 'axios';
import FormData from 'form-data';
import { getUserFromToken, isSuccessfulResponse } from '../../util';
import { supabaseService } from '../supabase/supabaseService';
import { AudioModel } from './audioModel';

const TABLE = 'audios';
const BUCKET = 'audio';

export const AudioService = {
  async getList(token: string): Promise<AudioModel[]> {
    return await supabaseService.findMany(token, TABLE, '*', (q: any) => q);
  },

  async getOne(
    token: string,
    audioId: string
  ): Promise<AudioModel | undefined> {
    return await supabaseService.findById<AudioModel>(token, TABLE, audioId);
  },

  /** SERVICE: handle file upload + moderation + insert record */
  async create(
    token: string,
    body: any,
    file?: Express.Multer.File
  ): Promise<AudioModel> {
    const hasFile = !!file;

    if (!hasFile) {
      throw { status: 400, message: `Provide "file" or "file_url".` };
    }
    const ownerId = (await getUserFromToken(token))?.user?.id;

    // Check bucket
    const exists = await supabaseService.bucketExists(BUCKET);
    console.log(exists);

    if (!exists) throw { status: 400, message: `Bucket "${BUCKET}" missing.` };

    const meta = await supabaseService.getBucketInfo(BUCKET);
    const isPublicBucket = !!meta?.public;

    const safe = (file.originalname || 'upload.bin').replace(/[^\w.\-]/g, '_');
    const path = `${Date.now()}_${safe}`;

    // Upload
    await supabaseService.uploadObject(
      BUCKET,
      path,
      file.buffer,
      file.mimetype,
      true
    );

    // Build URL
    const fileUrl = isPublicBucket
      ? supabaseService.getPublicUrl(BUCKET, path)
      : await supabaseService.createSignedUrl(BUCKET, path);

    const payload: Partial<AudioModel> = {
      file_url: fileUrl,
      owner_id: ownerId,
      ...body,
    };
    console.log(payload);

    return await supabaseService.create<AudioModel>(token, TABLE, payload);
  },

  /** SERVICE: update */
  async update(
    token: string,
    id: string,
    body: Partial<AudioModel>
  ): Promise<AudioModel> {
    const payload: Partial<AudioModel> = {
      ...body,
    };
    console.log(id, payload);
    return await supabaseService.updateById<AudioModel>(
      token,
      TABLE,
      id,
      payload
    );
  },

  /** SERVICE: delete */
  async delete(token: string, mediaId: string): Promise<boolean> {
    return await supabaseService.deleteById(token, TABLE, mediaId);
  },
};
