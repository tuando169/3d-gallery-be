import type { Request, Response, NextFunction } from 'express';
import { ImageService } from '../services/imageService';

export const ImageController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ImageService.getAll(req.accessToken!);

      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const row = await ImageService.create(
        req.accessToken!,
        req.body,
        req.file
      );
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ImageService.update(
        req.accessToken!,
        req.params.id,
        req.body
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const mediaId = req.query.media_id as string;
      if (!mediaId) throw new Error('media_id is required');

      const data = await ImageService.delete(req.accessToken!, mediaId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
