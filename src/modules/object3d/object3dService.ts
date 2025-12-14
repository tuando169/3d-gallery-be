import { supabaseAdmin } from "../../config/supabase";
import { Object3DModel } from "./object3dModel";
import {
  deleteOldFileFromBucket,
  getUserFromToken,
  uploadFileToBucket,
} from "../../util";
import { supabaseService } from "../supabase/supabaseService";
import { RoleEnum } from "../../constants/role";

const TABLE = "object3d";
const BUCKET = "object3d";

export const Object3DService = {
  /** LIST */
  async getAll(token: string): Promise<Object3DModel[]> {
    const user = await getUserFromToken(token);
    if (user.user?.role == RoleEnum.Admin)
      return await supabaseService.findMany(token, TABLE, "*", (q: any) => q);
    return await supabaseService.findMany(token, TABLE, "*", (q) =>
      q.eq("owner_id", user?.user?.id)
    );
  },

  /** Get one by ID */
  async getOne(
    token: string,
    objectId: string
  ): Promise<Object3DModel | undefined> {
    const list = await Object3DService.getAll(token);
    return Promise.resolve(
      list.find((item: Object3DModel) => item.id === objectId)
    );
  },

  /** UPLOAD FILE TO STORAGE */
  async uploadGLB(ownerId: string, file: Express.Multer.File) {
    const filename = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
    const filepath = `${ownerId}/${filename}`;

    // Upload
    const up = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filepath, file.buffer, {
        contentType: "model/gltf-binary",
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

    const fileUrl = await uploadFileToBucket(BUCKET, file);

    const payload: Partial<Object3DModel> = {
      owner_id: ownerId,
      file_url: fileUrl,
      metadata: body.metadata,
    };

    return await supabaseService.create<Object3DModel>(token, TABLE, payload);
  },

  /** UPDATE */
  async update(
    token: string,
    objectId: string,
    body: any,
    file?: Express.Multer.File
  ): Promise<Object3DModel> {
    const ownerId = (await getUserFromToken(token))?.user?.id;
    const payload: Partial<Object3DModel> = {
      room_ids: body.room_ids,
      metadata: body.metadata,
      title: body.title,
      owner_id: ownerId,
    };

    if (file) {
      payload.file_url = await uploadFileToBucket(BUCKET, file);
      const oldRecord = await Object3DService.getOne(token, objectId);
      if (oldRecord) await deleteOldFileFromBucket(BUCKET, oldRecord.file_url);
    }

    return await supabaseService.updateById(token, TABLE, objectId, payload);
  },

  /** DELETE */
  async delete(token: string, id: string): Promise<void> {
    try {
      await supabaseService.deleteById(token, TABLE, id);
      const oldRecord = await Object3DService.getOne(token, id);
      if (oldRecord) await deleteOldFileFromBucket(BUCKET, oldRecord.file_url);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
