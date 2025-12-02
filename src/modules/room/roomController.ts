import type { Request, Response, NextFunction } from 'express';
import { RoomService } from './roomService';
import { RoomModel } from '../models/roomModel';

export const RoomController = {
  /** GET /rooms */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await RoomService.getAll(req.accessToken!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  /** GET /rooms/:id */
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await RoomService.getOne(req.accessToken!, req.params.id);

      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  /** POST /rooms */
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
      const deleted = await RoomService.delete(req.accessToken!, id);

      res.json(deleted);
    } catch (err) {
      next(err);
    }
  },
};
