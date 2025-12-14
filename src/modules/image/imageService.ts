import axios from "axios";
import FormData from "form-data";
import { ImageAnalyzeModel, ImageModel } from "./imageModel";
import {
  deleteOldFileFromBucket,
  getUserFromToken,
  isSuccessfulResponse,
  uploadFileToBucket,
} from "../../util";
import { supabaseService } from "../supabase/supabaseService";
import { RoleEnum } from "../../constants/role";

const TABLE = "images";
const BUCKET = "images";

export const ImageService = {
  async getList(token: string): Promise<ImageModel[]> {
    const user = await getUserFromToken(token);
    if (user.user?.role == RoleEnum.Admin)
      return await supabaseService.findMany(token, TABLE, "*", (q: any) => q);
    return await supabaseService.findMany(token, TABLE, "*", (q: any) =>
      q.eq("owner_id", user?.user?.id)
    );
  },

  async getOne(
    token: string,
    imageId: string
  ): Promise<ImageModel | undefined> {
    const list = await ImageService.getList(token);
    return Promise.resolve(
      list.find((item: ImageModel) => item.id === imageId)
    );
  },

  async create(
    token: string,
    body: any,
    file?: Express.Multer.File
  ): Promise<ImageModel> {
    const hasFile = !!file;

    if (!hasFile) {
      throw { status: 400, message: `Provide "file".` };
    }

    const exists = await supabaseService.bucketExists(BUCKET);
    console.log(exists);

    if (!exists) throw { status: 400, message: `Bucket "${BUCKET}" missing.` };

    const meta = await supabaseService.getBucketInfo(BUCKET);
    const isPublicBucket = !!meta?.public;

    const safe = (file.originalname || "upload.bin").replace(/[^\w.\-]/g, "_");
    const path = `${Date.now()}_${safe}`;

    // const form = new FormData();
    // form.append("image", file.buffer, {
    //   filename: file.originalname,
    //   contentType: file.mimetype,
    // });

    // const analyze = await axios.post(
    //   "https://zipppier-henry-bananas.ngrok-free.dev/analyze",
    //   form,
    //   { headers: form.getHeaders() }
    // );

    // if (analyze && isSuccessfulResponse(analyze)) {
    //   const data: ImageAnalyzeModel = analyze.data;
    //   if (data.is_nsfw)
    //     throw { status: 422, message: "Media file is not approved!" };
    // }

    await supabaseService.uploadObject(
      BUCKET,
      path,
      file.buffer,
      file.mimetype,
      true
    );

    const fileUrl = isPublicBucket
      ? supabaseService.getPublicUrl(BUCKET, path)
      : await supabaseService.createSignedUrl(BUCKET, path);

    const owner_id = (await getUserFromToken(token)).user?.id;

    const payload: Partial<ImageModel> = {
      file_url: fileUrl,
      owner_id: owner_id,
      title: body.title,
    };

    return await supabaseService.create<ImageModel>(token, TABLE, payload);
  },

  async update(
    token: string,
    id: string,
    body: Partial<ImageModel>,
    file?: Express.Multer.File
  ): Promise<ImageModel> {
    const payload: Partial<ImageModel> = {
      id: id,
      room_ids: body.room_ids,
      title: body.title,
    };
    const oldRecord = await ImageService.getOne(token, id);
    if (file) {
      payload.file_url = await uploadFileToBucket(BUCKET, file);
      if (oldRecord) await deleteOldFileFromBucket(BUCKET, oldRecord.file_url);
    }

    return await supabaseService.updateById<ImageModel>(
      token,
      TABLE,
      id,
      payload
    );
  },

  async delete(token: string, mediaId: string): Promise<void> {
    try {
      await supabaseService.deleteById(token, TABLE, mediaId);
      const oldRecord = await ImageService.getOne(token, mediaId);
      if (oldRecord) await deleteOldFileFromBucket(BUCKET, oldRecord.file_url);

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
