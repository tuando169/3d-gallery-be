import type { Request, Response, NextFunction } from 'express';
import { Object3DService } from './object3dService';

export const Object3DController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Object3DService.getAll(req.accessToken!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async gen3DFromImage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Object3DService.gen3DFromImage(
        req.accessToken!,
        req.file!
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Object3DService.getOne(
        req.accessToken!,
        req.params.id
      );
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
        req.file
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
        req.file
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await Object3DService.delete(
        req.accessToken!,
        req.params.id
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
