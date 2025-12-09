import type { Request, Response, NextFunction } from "express";
import { NewsService } from "./newsService";

export const NewsController = {
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NewsService.getAll(req.accessToken!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // req.files được multer.any() sinh ra
      const files = req.files as Express.Multer.File[];

      const data = await NewsService.create(
        req.accessToken!, // token
        req.body,
        files
      );

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
        req.body,
        req.files as Express.Multer.File[]
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
