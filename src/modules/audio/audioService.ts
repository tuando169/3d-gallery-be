import axios from "axios";
import FormData from "form-data";
import {
  deleteOldFileFromBucket,
  getUserFromToken,
  isSuccessfulResponse,
  uploadFileToBucket,
} from "../../util";
import { supabaseService } from "../supabase/supabaseService";
import { AudioModel } from "./audioModel";

const TABLE = "audios";
const BUCKET = "audio";

export const AudioService = {
  async getList(token: string): Promise<AudioModel[]> {
    const user = await getUserFromToken(token);
    return await supabaseService.findMany(token, TABLE, "*", (q: any) =>
      q.eq("owner_id", user?.user?.id)
    );
  },

  async getOne(
    token: string,
    audioId: string
  ): Promise<AudioModel | undefined> {
    const list = await AudioService.getList(token);
    return Promise.resolve(
      list.find((item: AudioModel) => item.id === audioId)
    );
  },

  /** SERVICE: handle file upload + moderation + insert record */
  async create(
    token: string,
    body: any,
    file: Express.Multer.File
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

    const safe = (file.originalname || "upload.bin").replace(/[^\w.\-]/g, "_");
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
      title: body.title,
      metadata: body.metadata,
    };

    return await supabaseService.create<AudioModel>(token, TABLE, payload);
  },

  /** SERVICE: update */
  async update(
    token: string,
    id: string,
    body: Partial<AudioModel>,
    file?: Express.Multer.File
  ): Promise<AudioModel> {
    const payload: Partial<AudioModel> = {
      id: id,
      title: body.title,
      owner_id: (await getUserFromToken(token))?.user?.id,
    };
    if (file) {
      payload.file_url = await uploadFileToBucket(BUCKET, file);

      const oldRecord = await AudioService.getOne(token, id);
      if (oldRecord) await deleteOldFileFromBucket(BUCKET, oldRecord.file_url);
    }
    return await supabaseService.updateById<AudioModel>(
      token,
      TABLE,
      id,
      payload
    );
  },

  /** SERVICE: delete */
  async delete(token: string, mediaId: string): Promise<void> {
    try {
      await supabaseService.deleteById(token, TABLE, mediaId);
      const oldRecord = await AudioService.getOne(token, mediaId);
      if (oldRecord) await deleteOldFileFromBucket(BUCKET, oldRecord.file_url);
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
