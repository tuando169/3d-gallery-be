import { uploadFileToBucket } from "../../util";
import { supabaseService } from "../supabase/supabaseService";
import { TextureModel } from "./textureModel";
import path from "path";

const TABLE = "textures";
const BUCKET = "textures";

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
      alb?: Express.Multer.File[];
      nor?: Express.Multer.File[];
      orm?: Express.Multer.File[];
    }
  ): Promise<TextureModel> {
    const { title, texture_for } = body;

    if (!texture_for) throw { status: 400, message: "texture_for required" };

    const fileAlb = files?.alb?.[0];
    const fileNor = files?.nor?.[0];
    const fileOrm = files?.orm?.[0];

    const hasAnyFile = fileAlb || fileNor || fileOrm;

    if (!hasAnyFile) {
      throw { status: 400, message: "Provide alb/nor/orm or *_url" };
    }

    const payload: Partial<TextureModel> = {
      title: title || "Untitled Texture",
      texture_for: texture_for,
      alb_url: await uploadFileToBucket(BUCKET, fileAlb!),
      nor_url: await uploadFileToBucket(BUCKET, fileNor!),
      orm_url: await uploadFileToBucket(BUCKET, fileOrm!),
    };
    console.log(payload);

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
    const texture_for = body.texture_for;

    const fileAlb = files?.alb?.[0];
    const fileNor = files?.nor?.[0];
    const fileOrm = files?.orm?.[0];

    const changes: Partial<TextureModel> = {
      title: body.title,
      alb_url: fileAlb
        ? await uploadFileToBucket(BUCKET, fileAlb)
        : body.alb_url,
      nor_url: fileNor
        ? await uploadFileToBucket(BUCKET, fileNor)
        : body.nor_url,
      orm_url: fileOrm
        ? await uploadFileToBucket(BUCKET, fileOrm)
        : body.orm_url,
      texture_for: texture_for,
    };
    console.log(changes);

    return await supabaseService.updateByIdAdmin<TextureModel>(
      TABLE,
      textureId,
      changes
    );
  },

  /** DELETE */
  async delete(id: string): Promise<void> {
    await supabaseService.deleteByIdAdmin(TABLE, id);
    return Promise.resolve();
  },
};
