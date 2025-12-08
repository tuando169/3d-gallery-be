import type { Request, Response, NextFunction } from 'express';
import { RoomService } from './roomService';

export const RoomController = {
  /** GET /rooms */
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await RoomService.getList(req.accessToken!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  /** GET /rooms/:id */
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await RoomService.getOne(req.accessToken!, req.params.id);
      if (!data) return res.status(404).json({ message: 'Room not found' });

      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  /** POST /room */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await RoomService.create(
        req.accessToken!,
        req.body,
        req.file!
      );

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /rooms/:id */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await RoomService.update(
        req.accessToken!,
        req.params.id,
        req.body,
        req.file
      );

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /rooms */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      await RoomService.delete(req.accessToken!, id);
      res.status(200);
    } catch (err) {
      next(err);
    }
  },
};
