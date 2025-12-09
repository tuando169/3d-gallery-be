import axios from 'axios';
import FormData from 'form-data';
import { ImageAnalyzeModel, ImageModel } from './imageModel';
import {
  getUserFromToken,
  isSuccessfulResponse,
  uploadFileToBucket,
} from '../../util';
import { supabaseService } from '../supabase/supabaseService';

const TABLE = 'images';
const BUCKET = 'images';

export const ImageService = {
  /** SERVICE: list images */
  async getList(token: string): Promise<ImageModel[]> {
    const user = await getUserFromToken(token);
    return await supabaseService.findMany(token, TABLE, '*', (q: any) => q.eq('owner_id', user?.user?.id));
  },

  /** SERVICE: get one image */
  async getOne(
    token: string,
    imageId: string
  ): Promise<ImageModel | undefined> {
    return await supabaseService.findById<ImageModel>(token, TABLE, imageId);
  },

  /** SERVICE: handle file upload + moderation + insert record */
  async create(
    token: string,
    body: any,
    file?: Express.Multer.File
  ): Promise<ImageModel> {
    const hasFile = !!file;

    if (!hasFile) {
      throw { status: 400, message: `Provide "file".` };
    }

    // Check bucket
    const exists = await supabaseService.bucketExists(BUCKET);
    console.log(exists);

    if (!exists) throw { status: 400, message: `Bucket "${BUCKET}" missing.` };

    const meta = await supabaseService.getBucketInfo(BUCKET);
    const isPublicBucket = !!meta?.public;

    // =====================
    // CASE 1: UPLOAD FILE
    // =====================
    const safe = (file.originalname || 'upload.bin').replace(/[^\w.\-]/g, '_');
    const path = `${Date.now()}_${safe}`;

    const form = new FormData();
    form.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const analyze = await axios.post(
      'https://zipppier-henry-bananas.ngrok-free.dev/analyze',
      form,
      { headers: form.getHeaders() }
    );

    if (isSuccessfulResponse(analyze)) {
      const data: ImageAnalyzeModel = analyze.data;
      if (data.is_nsfw)
        throw { status: 422, message: 'Media file is not approved!' };
    }

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

    const owner_id = (await getUserFromToken(token)).user?.id;

    const payload: Partial<ImageModel> = {
      file_url: fileUrl,
      owner_id: owner_id,
      room_id: body.room_id,
      title: body.title,
    };

    return await supabaseService.create<ImageModel>(token, TABLE, payload);
  },

  /** SERVICE: update */
  async update(
    token: string,
    id: string,
    body: Partial<ImageModel>,
    file?: Express.Multer.File
  ): Promise<ImageModel> {
    const payload: Partial<ImageModel> = {
      id: id,
      room_id: body.room_id,
      title: body.title,
    };
    if (file) body.file_url = await uploadFileToBucket(BUCKET, file);

    return await supabaseService.updateById<ImageModel>(
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
