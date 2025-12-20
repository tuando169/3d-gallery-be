import {
  getUserFromToken,
  uploadFileToBucket,
  deleteFileFromBucket,
  getOwnedMediaCount,
} from '../../util';
import { supabaseService } from '../supabase/supabaseService';
import { AudioModel } from './audioModel';
import { RoleEnum } from '../../constants/role';
import { LicenseService } from '../license/licenseService';

const TABLE = 'audios';
const BUCKET = 'audio';

export const AudioService = {
  async getList(token: string): Promise<AudioModel[]> {
    const user = await getUserFromToken(token);
    if (user.user?.role == RoleEnum.Admin)
      return await supabaseService.findMany(token, TABLE, '*', (q: any) => q);
    return await supabaseService.findMany(token, TABLE, '*', (q: any) =>
      q.eq('owner_id', user?.user?.id)
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
    const user = await getUserFromToken(token);
    const owner_id = user?.user?.id;
    const role = user?.user?.role;
    if (role !== RoleEnum.Admin && owner_id) {
      const mediaCount = await getOwnedMediaCount(token);
      const license = await LicenseService.getOne(user.user?.license || '');
      if (!license) {
        throw {
          status: 403,
          message: 'You need a license to upload audio.',
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
    const payload: Partial<AudioModel> = {
      file_url: await uploadFileToBucket(BUCKET, file),
      owner_id: owner_id,
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
      room_ids: body.room_ids,
    };
    if (file) {
      payload.file_url = await uploadFileToBucket(BUCKET, file);

      const oldRecord = await AudioService.getOne(token, id);
      if (oldRecord) await deleteFileFromBucket(BUCKET, oldRecord.file_url);
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
      if (oldRecord) await deleteFileFromBucket(BUCKET, oldRecord.file_url);
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async getOwnedAudioCount(token: string): Promise<number> {
    const list = await AudioService.getList(token);
    return Promise.resolve(list.length);
  },
};
