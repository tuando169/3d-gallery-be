import { ImageModel } from './imageModel';
import {
  deleteFileFromBucket,
  getOwnedMediaCount,
  getUserFromToken,
  isSuccessfulResponse,
  uploadFileToBucket,
} from '../../util';
import { supabaseService } from '../supabase/supabaseService';
import { RoleEnum } from '../../constants/role';
import { LicenseService } from '../license/licenseService';

const TABLE = 'images';
const BUCKET = 'images';

export const ImageService = {
  async getList(token: string): Promise<ImageModel[]> {
    const user = await getUserFromToken(token);
    if (user.user?.role == RoleEnum.Admin)
      return await supabaseService.findMany(token, TABLE, '*', (q: any) => q);
    return await supabaseService.findMany(token, TABLE, '*', (q: any) =>
      q.eq('owner_id', user?.user?.id)
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

    const user = await getUserFromToken(token);
    const owner_id = user?.user?.id;
    const role = user?.user?.role;
    if (role !== RoleEnum.Admin && owner_id) {
      const mediaCount = await getOwnedMediaCount(token);
      const license = await LicenseService.getOne(user.user?.license || '');

      if (!license) {
        throw {
          status: 403,
          message: 'You need a license to upload images.',
        };
      }
      const maxMedia = license.media_limit || 0;
      if (mediaCount >= maxMedia) {
        throw {
          status: 429,
          message: `Media upload limit reached. Max allowed: ${maxMedia}.`,
        };
      }
    }

    const payload: Partial<ImageModel> = {
      file_url: await uploadFileToBucket(BUCKET, file!),
      owner_id: owner_id,
      title: body.title,
      ...body
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
      ...body
    };
    const oldRecord = await ImageService.getOne(token, id);
    if (file) {
      payload.file_url = await uploadFileToBucket(BUCKET, file);
      if (oldRecord) await deleteFileFromBucket(BUCKET, oldRecord.file_url);
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
      const oldRecord = await ImageService.getOne(token, mediaId);
      if (oldRecord) await deleteFileFromBucket(BUCKET, oldRecord.file_url);
      await supabaseService.deleteById(token, TABLE, mediaId);

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async getOwnedImageCount(token: string): Promise<number> {
    const list = await ImageService.getList(token);
    return Promise.resolve(list.length);
  },
};
