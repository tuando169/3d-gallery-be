import type { Request, Response, NextFunction } from 'express';
import { Object3DService } from '../services/object3dService';

export const Object3DController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Object3DService.list(req.accessToken!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Object3DService.create(
        req.accessToken!,
        req.body,
        req.file,
        req.user?.id
      );
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Object3DService.update(
        req.accessToken!,
        req.params.id,
        req.body,
        req.file,
        req.user?.id
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Object3DService.remove(
        req.accessToken!,
        req.params.id
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
