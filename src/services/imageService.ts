import axios from 'axios';
import FormData from 'form-data';
import { supabaseService } from './supabaseService';
import { ImageModel } from '../models/imageModel';
import { isSuccessfulResponse } from '../util';
import { ImageAnalyzeModel } from '../models/imageAnalyzeModel';

const TABLE = 'images';
const BUCKET = 'images';

const ALLOWED_DB_FIELDS = new Set([
  'file_url',
  'width',
  'height',
  'title',
  'description',
  'room_id',
]);

function pickAllowed(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined && v !== null && ALLOWED_DB_FIELDS.has(k)) {
      out[k] = v;
    }
  }
  return out;
}

export const ImageService = {
  /** SERVICE: list images */
  async list(
    token: string,
    page: number,
    pageSize: number
  ): Promise<ImageModel[]> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    return await supabaseService.findAllAdmin(TABLE, '*', (q: any) =>
      q.range(from, to)
    );
  },

  /** SERVICE: handle file upload + moderation + insert record */
  async create(token: string, body: any, file?: Express.Multer.File) {
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

      const payload = pickAllowed({
        file_url: fileUrl,
        ...body,
      });

      return await supabaseService.create(token, TABLE, payload);
    }

    // =====================
    // CASE 2: use file_url
    // =====================
    const payload = pickAllowed(body);
    if (!payload.file_url) {
      throw { status: 400, message: `"file_url" missing.` };
    }

    return await supabaseService.create(token, TABLE, payload);
  },

  /** SERVICE: update */
  async update(token: string, id: string, patch: any) {
    const payload = pickAllowed(patch);
    return await supabaseService.updateById(token, TABLE, id, payload);
  },

  /** SERVICE: delete */
  async remove(token: string, mediaId: string) {
    return await supabaseService.deleteById(token, TABLE, mediaId);
  },
};
