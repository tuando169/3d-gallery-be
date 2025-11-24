import { supabaseService } from './supabaseService';
import { userService } from './userService';
import { supabaseAdmin } from '../config/supabase';
import { getUserFromToken } from '../util';
import { Request } from 'express';
import { RoleEnum } from '../constants/role';
import { VisibilityEnum } from '../constants/visibility';
import { RoomModel } from '../models/roomModel';

const TABLE = 'rooms';
const BUCKET = 'roomjson';

function isAdmin(user: any) {
  return user?.user_metadata?.role === 'admin';
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
  /** LIST ROOMS */
  async getAll(token: string): Promise<RoomModel[]> {
    try {
      const user = await getUserFromToken(token);
      const isAdminUser = isAdmin(user.user);

      let data;

      if (isAdminUser) {
        data = await supabaseService.findAllAdmin(TABLE, '*', (q) => q);
      } else {
        const publicRoom = await supabaseService.findAllAdmin(TABLE, '*', (q) =>
          q.eq('visibility', VisibilityEnum.Public)
        );
        const userRoom = await supabaseService.findMany(token, TABLE, '*');
        // Gộp 2 mảng và loại bỏ trùng lặp (nếu có)
        const combinedRooms = [...publicRoom, ...userRoom];
        const uniqueRoomsMap = new Map();
        for (const room of combinedRooms) {
          uniqueRoomsMap.set(room.id, room);
        }
        data = Array.from(uniqueRoomsMap.values());
      }

      const ownerIds = Array.from(
        new Set(data.map((r: any) => r.owner_id).filter(Boolean))
      );

      const authors = await Promise.all(
        ownerIds.map((id) => userService.getById(id).catch(() => null))
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

  /** GET ONE ROOM */
  async getOne(token: string, roomId: string): Promise<RoomModel | undefined> {
    const user = await getUserFromToken(token);
    if (isAdmin(user.user)) {
      const rooms = await supabaseService.findAllAdmin(TABLE, '*', (q: any) =>
        q.eq('id', roomId)
      );
      return rooms[0] || null;
    }

    return supabaseService.findById(token, TABLE, roomId);
  },

  /** CREATE ROOM */
  async create(
    token: string,
    body: any,
    file?: Express.Multer.File
  ): Promise<RoomModel | undefined> {
    const user = await getUserFromToken(token);
    if (!isAdmin(user.user)) body.owner_id = user.user?.id;

    if (file) {
      body.room_json = JSON.parse(file.buffer.toString('utf8'));
    }

    normalizeTags(body);

    return supabaseService.create(token, TABLE, body);
  },

  /** UPDATE ROOM */
  async update(
    token: string,
    roomId: string,
    body: any,
    file?: Express.Multer.File
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

    if (file) {
      body.room_json = JSON.parse(file.buffer.toString('utf8'));
    }

    normalizeTags(body);

    return await supabaseService.updateById(token, TABLE, roomId, body);
  },

  /** DELETE ROOM */
  async delete(token: string, id: string): Promise<boolean> {
    const user = await getUserFromToken(token);
    if (!isAdmin(user.user)) {
      const room = await supabaseService.findById(token, TABLE, id);
      if (!room) {
        throw { status: 404, message: 'Not found' };
      }
      if (room.owner_id !== user.user?.id) {
        throw { status: 401, message: 'Not allowed' };
      }
    }

    await supabaseService.deleteById(token, TABLE, id);

    return true;
  },
};
