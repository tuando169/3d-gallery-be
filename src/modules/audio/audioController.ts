import type { Request, Response, NextFunction } from 'express';
import { AudioService } from './audioService';

export const AudioController = {
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AudioService.getList(req.accessToken!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AudioService.getOne(req.accessToken!, req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const row = await AudioService.create(
        req.accessToken!,
        req.body,
        req.file!
      );
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AudioService.update(
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

      const data = await AudioService.delete(req.accessToken!, mediaId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
