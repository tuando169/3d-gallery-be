import type { Request, Response, NextFunction } from 'express';
import { NewsService } from './newsService';

export const NewsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NewsService.getAll(req.accessToken!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NewsService.create(req.accessToken!, req.body);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NewsService.update(
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
      const data = await NewsService.remove(req.accessToken!, req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
