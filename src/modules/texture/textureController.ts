import type { Request, Response, NextFunction } from 'express';
import { TextureService } from './textureService';
import { supabaseService } from '../supabase/supabaseService';

export const TextureController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TextureService.getAll();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TextureService.getOne(req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as
        | Record<string, Express.Multer.File>
        | undefined;

      const fileAlb = files?.alb;
      const fileNor = files?.nor;
      const fileOrm = files?.orm;

      const data = await TextureService.create(
        {
          name: req.body.name ?? 'Untitled Texture',
          object3d_id: req.body.object3d_id,
        },
        {
          alb: fileAlb,
          nor: fileNor,
          orm: fileOrm,
        }
      );

      return res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TextureService.update(
        req.params.id,
        req.body,
        req.files as Record<string, Express.Multer.File> | undefined
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TextureService.delete(req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
