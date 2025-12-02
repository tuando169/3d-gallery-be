import { supabaseAdmin } from '../../config/supabase';
import { Object3DModel } from './object3dModel';
import { getUserFromToken } from '../../util';
import { supabaseService } from '../supabase/supabaseService';

const TABLE = 'object3d';
const BUCKET = 'object3d';

export const Object3DService = {
  /** LIST */
  async getAll(token: string): Promise<Object3DModel[]> {
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
    body: Partial<Object3DModel>,
    file?: Express.Multer.File
  ): Promise<Object3DModel> {
    if (!file) throw { status: 400, message: `Missing file "model"` };

    const ownerId = (await getUserFromToken(token))?.user?.id;
    if (!ownerId)
      throw { status: 400, message: 'owner_id is required (or login first)' };

    const fileUrl = await this.uploadGLB(ownerId, file);

    const payload: Partial<Object3DModel> = {
      owner_id: ownerId,
      room_id: body.room_id,
      file_url: fileUrl,
      poly_count: body.poly_count ? Number(body.poly_count) : undefined,
      bounds: body.bounds,
      source_type: body.source_type || 'upload',
    };

    return await supabaseService.create<Object3DModel>(token, TABLE, payload);
  },

  /** UPDATE */
  async update(
    token: string,
    objectId: string,
    body: any,
    file?: Express.Multer.File,
    userId?: string
  ): Promise<Object3DModel> {
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
  async delete(token: string, id: string): Promise<boolean> {
    return await supabaseService.deleteById(token, TABLE, id);
  },
};
