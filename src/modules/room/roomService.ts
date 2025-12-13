import { UserService } from '../user/userService';
import { getUserFromToken, uploadFileToBucket } from '../../util';
import { VisibilityEnum } from '../../constants/visibility';
import { RoomCollabModel, RoomModel } from './roomModel';
import { supabaseService } from '../supabase/supabaseService';
import { UserModel } from '../user/userModel';

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
    return Promise.resolve(data.filter((room) => room.type != 'template'));
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

  getTemplateList: async (): Promise<RoomModel[]> => {
    const data = await supabaseService.findAllAdmin(TABLE, '*', (q) =>
      q.eq('type', 'template')
    );

    return Promise.resolve(data);
  },

  async getOne(token: string, roomId: string): Promise<RoomModel | undefined> {
    const user = await getUserFromToken(token);
    console.log(user);

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
    return room;
  },

  async create(
    token: string,
    body: any,
    thumbnail: Express.Multer.File
  ): Promise<RoomModel | undefined> {
    const user = await getUserFromToken(token);
    if (!isAdmin(user.user)) body.owner_id = user.user?.id;

    normalizeTags(body);

    body.thumbnail = await uploadFileToBucket('images', thumbnail);
    console.log(body);

    return supabaseService.create(token, TABLE, body);
  },

  async buyTemplates(
    token: string,
    body: { template_ids: string[] }
  ): Promise<void> {
    const user = await getUserFromToken(token);
    const userId = user.user?.id;
    const templateIds = body.template_ids;
    const promises: Promise<RoomCollabModel>[] = [];
    templateIds.forEach((id) => {
      const payload: RoomCollabModel = {
        room_id: id,
        user_id: userId!,
      };
      promises.push(supabaseService.create(token, COLLAB_TABLE, payload));
    });
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
    if (thumbnail)
      body.thumbnail = await uploadFileToBucket('images', thumbnail);
    return await supabaseService.updateById(token, TABLE, roomId, body);
  },

  /** DELETE ROOM */
  async delete(token: string, id: string): Promise<void> {
    await supabaseService.deleteById(token, TABLE, id);
    Promise.resolve();
  },
};
