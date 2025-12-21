import { UserService } from '../user/userService';
import { getUserFromToken, uploadFileToBucket } from '../../util';
import { VisibilityEnum } from '../../constants/visibility';
import { RoomCollabModel, RoomModel } from './roomModel';
import { supabaseService } from '../supabase/supabaseService';
import { UserModel } from '../user/userModel';
import { RoleEnum } from '../../constants/role';
import { LicenseService } from '../license/licenseService';
import r from '../user/userRoute';

const TABLE = 'rooms';
const COLLAB_TABLE = 'room_collaborators';

function isAdmin(user?: UserModel) {
  return user?.role === 'admin';
}

function normalizeTags(body: any) {
  if (typeof body.tags === 'string') {
    const trimmed = body.tags.trim();
    body.tags = trimmed
      ? trimmed
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
  }
}

export const RoomService = {
  getPublic: async (): Promise<RoomModel[]> => {
    const data = await supabaseService.findAllAdmin(TABLE, '*', (q) =>
      q.eq('visibility', VisibilityEnum.Public)
    );

    const filteredData = data.filter((room) => room.type !== 'template');

    const rooms = await Promise.all(
      filteredData.map(async (room) => {
        const author = await UserService.getById(room.owner_id);

        return {
          ...room,
          author: author?.name || '',
        };
      })
    );

    return Promise.resolve(rooms);
  },

  async getList(token: string): Promise<RoomModel[]> {
    try {
      const user = await getUserFromToken(token);
      const isAdminUser = isAdmin(user.user);
      const allRooms = await supabaseService.findAllAdmin(TABLE, '*', (q) => q);
      let data: RoomModel[];
      console.log(user);

      if (isAdminUser) {
        data = allRooms;
      } else {
        const userRooms = allRooms.filter((r) => r.owner_id === user.user?.id);
        const collabRooms = await supabaseService.findAllAdmin(
          COLLAB_TABLE,
          'room_id',
          (q: any) => q.eq('user_id', user.user?.id)
        );

        const uniqueRoomIds = new Set([
          ...userRooms.map((r: any) => r.id),
          ...collabRooms.map((r: any) => r.room_id),
        ]);

        data = [];
        uniqueRoomIds.forEach((id) => {
          data.push(allRooms.find((r: any) => r.id === id));
        });
      }

      const ownerIds = Array.from(
        new Set(data.map((r: any) => r.owner_id).filter(Boolean))
      );

      const authors = await Promise.all(
        ownerIds.map((id) => UserService.getById(id).catch(() => null))
      );

      const authorMap = Object.fromEntries(
        authors.map((u) => [u?.id, u?.name])
      );

      return data.map((room: any) => ({
        ...room,
        author: authorMap[room.owner_id] ?? null,
      }));
    } catch (err) {
      throw err;
    }
  },

  getPublicTemplateList: async (): Promise<RoomModel[]> => {
    const data = await supabaseService.findAllAdmin(TABLE, '*', (q) =>
      q.eq('type', 'template')
    );
    const rooms = await Promise.all(
      data.map(async (room) => {
        const author = await UserService.getById(room.owner_id);
        room.author = author?.name || '';
      })
    );
    return Promise.resolve(data);
  },

  async getOne(token: string, roomId: string): Promise<RoomModel | undefined> {
    const user = await getUserFromToken(token);

    if (isAdmin(user.user)) {
      const rooms = await supabaseService.findAllAdmin(TABLE, '*', (q: any) =>
        q.eq('id', roomId)
      );
      return rooms[0] || undefined;
    }
    const room = await supabaseService.findById(token, TABLE, roomId);
    if (!room) {
      return undefined;
    }
    room.author = (await UserService.getById(room.owner_id))?.name || '';
    return Promise.resolve(room);
  },

  async create(
    token: string,
    body: any,
    thumbnail?: Express.Multer.File
  ): Promise<RoomModel | undefined> {
    const user = await getUserFromToken(token);
    const owner_id = user?.user?.id;
    const role = user?.user?.role;
    if (role !== RoleEnum.Admin && owner_id) {
      const roomCount = (await RoomService.getList(token)).filter(
        (r) => r.owner_id === owner_id
      ).length;
      const license = await LicenseService.getOne(user.user?.license || '');

      if (!license) {
        throw {
          status: 403,
          message: 'You need a license to create rooms.',
        };
      }
      const maxRooms = license.space_limit || 0;
      console.log(roomCount);
      console.log(maxRooms);

      if (roomCount >= maxRooms) {
        throw {
          status: 429,
          message: `Room creation limit reached. Max allowed: ${maxRooms}.`,
        };
      }
    }
    if (!isAdmin(user.user)) body.owner_id = user.user?.id;

    normalizeTags(body);
    normalizeTags(body);

    const { thumbnailUrl, ...payload } = body as any;

    if (thumbnailUrl) {
      payload.thumbnail = thumbnailUrl;
    } else if (thumbnail) {
      payload.thumbnail = await uploadFileToBucket('images', thumbnail);
    }

    console.log(payload);

    return supabaseService.create(token, TABLE, payload);
  },

  async buyTemplate(
    token: string,
    body: { template_id: string }
  ): Promise<void> {
    const user = await getUserFromToken(token);
    const userId = user.user?.id;
    const templateId = body.template_id;
    const promises: Promise<RoomCollabModel>[] = [];
    const payload: RoomCollabModel = {
      room_id: templateId,
      user_id: userId!,
    };
    promises.push(supabaseService.insertAdmin(COLLAB_TABLE, payload));
    await Promise.all(promises);
    return Promise.resolve();
  },

  async buyTemplateByUserId(
    userId: string,
    body: { template_id: string }
  ): Promise<void> {
    const templateId = body.template_id;
    const promises: Promise<RoomCollabModel>[] = [];
    const payload: RoomCollabModel = {
      room_id: templateId,
      user_id: userId!,
    };
    promises.push(supabaseService.insertAdmin(COLLAB_TABLE, payload));
    await Promise.all(promises);
    return Promise.resolve();
  },

  async update(
    token: string,
    roomId: string,
    body: any,
    thumbnail?: Express.Multer.File
  ): Promise<RoomModel | undefined> {
    const user = await getUserFromToken(token);
    if (!isAdmin(user.user)) {
      const room = await supabaseService.findById(token, TABLE, roomId);
      if (!room) {
        throw { status: 404, message: 'Not found' };
      }
      if (room.owner_id !== user.user?.id) {
        throw { status: 401, message: 'Not allowed' };
      }
    }

    normalizeTags(body);
    if (body.thumbnailUrl) body.thumbnail = body.thumbnailUrl;
    else if (thumbnail)
      body.thumbnail = await uploadFileToBucket('images', thumbnail);

    return await supabaseService.updateById(token, TABLE, roomId, body);
  },

  /** DELETE ROOM */
  async delete(token: string, id: string): Promise<void> {
    await supabaseService.deleteById(token, TABLE, id);
    Promise.resolve();
  },
};
