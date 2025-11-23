import { supabaseAdmin } from '../config/supabase';
import { supabaseService } from './supabaseService';

const TABLE = 'object3d';
const BUCKET = 'object3d';

export const Object3DService = {
  /** LIST */
  async list(token: string) {
    return await supabaseService.findMany(token, TABLE, '*', (q) => q);
  },

  /** UPLOAD FILE TO STORAGE */
  async uploadGLB(ownerId: string, file: Express.Multer.File) {
    const filename = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    const filepath = `${ownerId}/${filename}`;

    // Upload
    const up = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filepath, file.buffer, {
        contentType: 'model/gltf-binary',
        upsert: false,
      });
    if (up.error) throw up.error;

    // Get public URL
    const { data: pub } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filepath);

    return pub?.publicUrl || filepath;
  },

  /** CREATE */
  async create(
    token: string,
    body: any,
    file: Express.Multer.File | undefined,
    userId?: string
  ) {
    if (!file) throw { status: 400, message: `Missing file "model"` };

    const ownerId = userId || body.owner_id;
    if (!ownerId)
      throw { status: 400, message: 'owner_id is required (or login first)' };

    const fileUrl = await this.uploadGLB(ownerId, file);

    const payload = {
      owner_id: ownerId,
      room_id: body.room_id || null,
      file_url: fileUrl,
      poly_count: body.poly_count ? Number(body.poly_count) : null,
      bounds: body.bounds ? JSON.parse(body.bounds) : null,
      source_type: body.source_type || 'upload',
    };

    return await supabaseService.create(token, TABLE, payload);
  },

  /** UPDATE */
  async update(
    token: string,
    objectId: string,
    body: any,
    file?: Express.Multer.File,
    userId?: string
  ) {
    const patch: any = { ...body };

    if (patch.poly_count) patch.poly_count = Number(patch.poly_count);
    if (typeof patch.bounds === 'string')
      patch.bounds = JSON.parse(patch.bounds);

    // Nếu có file mới → upload thay thế
    if (file) {
      const ownerId = userId || body.owner_id;
      patch.file_url = await this.uploadGLB(ownerId, file);
    }

    return await supabaseService.updateById(token, TABLE, objectId, patch);
  },

  /** DELETE */
  async remove(token: string, id: string) {
    return await supabaseService.deleteById(token, TABLE, id);
  },
};
