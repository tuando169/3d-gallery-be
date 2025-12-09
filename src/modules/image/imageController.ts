import type { Request, Response, NextFunction } from 'express';
import { ImageService } from './imageService';

export const ImageController = {
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ImageService.getList(req.accessToken!);

      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ImageService.getOne(req.accessToken!, req.params.id);
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
        req.body,
        req.file
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    console.log(1);

    try {
      const mediaId = req.params.id;
      console.log(mediaId);

      if (!mediaId) throw new Error('media_id is required');

      const data = await ImageService.delete(req.accessToken!, mediaId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
