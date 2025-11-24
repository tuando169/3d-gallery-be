import axios from 'axios';
import FormData from 'form-data';
import { supabaseService } from './supabaseService';
import { ImageModel } from '../models/imageModel';
import { isSuccessfulResponse } from '../util';
import { ImageAnalyzeModel } from '../models/imageAnalyzeModel';

const TABLE = 'images';
const BUCKET = 'images';

export const ImageService = {
  /** SERVICE: list images */
  async getAll(token: string): Promise<ImageModel[]> {
    return await supabaseService.findAllAdmin(TABLE, '*', (q: any) => q);
  },

  /** SERVICE: handle file upload + moderation + insert record */
  async create(
    token: string,
    body: any,
    file?: Express.Multer.File
  ): Promise<ImageModel> {
    const hasFile = !!file;
    const hasUrl = !!body?.file_url;

    if (!hasFile && !hasUrl) {
      throw { status: 400, message: `Provide "file" or "file_url".` };
    }

    // Check bucket
    const exists = await supabaseService.bucketExists(BUCKET);
    if (!exists) throw { status: 400, message: `Bucket "${BUCKET}" missing.` };

    const meta = await supabaseService.getBucketInfo(BUCKET);
    const isPublicBucket = !!meta?.public;

    // =====================
    // CASE 1: UPLOAD FILE
    // =====================
    if (file) {
      const safe = (file.originalname || 'upload.bin').replace(
        /[^\w.\-]/g,
        '_'
      );
      const path = `${Date.now()}_${safe}`;

      // Moderation
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
        if (!data.ok)
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

      const payload: Partial<ImageModel> = {
        file_url: fileUrl,
        ...body,
      };

      return await supabaseService.create<ImageModel>(token, TABLE, payload);
    }

    // =====================
    // CASE 2: use file_url
    // =====================
    const payload: Partial<ImageModel> = {
      ...body,
    };
    if (!payload.file_url) {
      throw { status: 400, message: `"file_url" missing.` };
    }

    return await supabaseService.create<ImageModel>(token, TABLE, payload);
  },

  /** SERVICE: update */
  async update(token: string, id: string, patch: any): Promise<ImageModel> {
    const payload: Partial<ImageModel> = {
      ...patch,
    };
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
