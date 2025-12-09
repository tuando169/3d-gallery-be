import { NewsItemTypeEnum } from "../../constants/newsItemType";
import { getUserFromToken, uploadFileToBucket } from "../../util";
import { supabaseService } from "../supabase/supabaseService";
import { NewsModel, NewsUploadModel } from "./newsModel";

const TABLE = "magazines";
const IMAGE_BUCKET = "images";
const OBJECT3D_BUCKET = "object3d";

async function convertLayoutJson(
  layout_json: any[],
  itemFiles: Record<number, Express.Multer.File>
) {
  const newLayout = [...layout_json];

  for (const [indexStr, file] of Object.entries(itemFiles)) {
    const index = Number(indexStr);
    const block = newLayout[index];

    if (!block || !file) continue;

    if (block.type === NewsItemTypeEnum.Object3D) {
      block.content = await uploadFileToBucket(OBJECT3D_BUCKET, file);
    } else {
      block.content = await uploadFileToBucket(IMAGE_BUCKET, file);
    }
  }

  return newLayout;
}

function extractFiles(files: Express.Multer.File[]) {
  let thumbnailFile: Express.Multer.File | null = null;
  const itemFiles: Record<number, Express.Multer.File> = {};

  for (const file of files) {
    if (file.fieldname === "thumbnail") {
      thumbnailFile = file;
      continue;
    }

    const match = file.fieldname.match(/^items\[(\d+)\]$/);
    if (match) {
      const index = Number(match[1]);
      itemFiles[index] = file;
    }
  }

  return { thumbnailFile, itemFiles };
}

export const NewsService = {
  async getAll(token: string): Promise<NewsModel[]> {
    return await supabaseService.findAllAdmin(TABLE, "*", (q: any) => q);
  },

  async create(token: string, body: any, files: Express.Multer.File[]) {
    const { title, slug, description, visibility } = body;

    let layout_json = [];
    try {
      layout_json = JSON.parse(body.layout_json);
    } catch (err) {
      throw new Error("layout_json không hợp lệ");
    }

    const { thumbnailFile, itemFiles } = extractFiles(files);

    let thumbnail_url = null;
    if (thumbnailFile) {
      thumbnail_url = await uploadFileToBucket(IMAGE_BUCKET, thumbnailFile);
    }

    layout_json = await convertLayoutJson(layout_json, itemFiles);

    const user = await getUserFromToken(token);
    const owner_id = user?.user?.id;

    const newsInsertPayload = {
      title,
      slug,
      owner_id,
      description,
      visibility,
      thumbnail: thumbnail_url,
      layout_json,
    };

    console.log("DEBUG → CREATE PAYLOAD:", newsInsertPayload);

    return await supabaseService.create(token, TABLE, newsInsertPayload);
  },

  async update(
    token: string,
    id: string,
    body: any,
    files: Express.Multer.File[]
  ) {
    const { title, slug, description, visibility } = body;

    let layout_json = [];
    try {
      layout_json = JSON.parse(body.layout_json);
    } catch (err) {
      throw new Error("layout_json không hợp lệ");
    }

    const { thumbnailFile, itemFiles } = extractFiles(files);

    layout_json = await convertLayoutJson(layout_json, itemFiles);

    const newsUpdatePayload = {
      title,
      slug,
      description,
      visibility,
      layout_json,
    };

    console.log("DEBUG → UPDATE PAYLOAD:", newsUpdatePayload);

    return await supabaseService.updateById(
      token,
      TABLE,
      id,
      newsUpdatePayload
    );
  },

  async remove(token: string, id: string): Promise<boolean> {
    return await supabaseService.deleteById(token, TABLE, id);
  },
};
