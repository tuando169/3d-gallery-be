import type { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/roomService';

export const RoomController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.page_size) || 10;

      const data = await RoomService.list(
        req.accessToken ?? null,
        page,
        pageSize
      );

      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: 'Missing room id' });

      const data = await RoomService.getOne(req.accessToken ?? null, id);

      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await RoomService.create(
        req.accessToken!,
        req.body,
        req.file
      );

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const roomId = req.query.room_id as string;
      if (!roomId) {
        return res.status(400).json({ message: 'room_id is required' });
      }

      const updated = await RoomService.update(
        req.accessToken!,
        roomId,
        req.body,
        req.file,
        req.user?.id
      );

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.body.room_ids;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          message: 'Provide: { room_ids: [...] }',
        });
      }

      const result = await RoomService.remove(req.accessToken!, ids);

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
