import type { Request, Response, NextFunction } from "express";
import { LicenseService } from "./licenseService";
import { LicenseUploadModel } from "./licenseModel";

export const NewsController = {
  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await LicenseService.getAll();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body: LicenseUploadModel = {
        title: req.body.title,
        price: req.body.price,
        media_limit: req.body.media_limit,
        space_limit: req.body.space_limit,
      }
      const data = await LicenseService.create(
        req.accessToken!,
        body
      );

      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body: LicenseUploadModel = {
        title: req.body.title,
        price: req.body.price,
        media_limit: req.body.media_limit,
        space_limit: req.body.space_limit,
      }
      const data = await LicenseService.update(
        req.accessToken!,
        req.params.id,
        body
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await LicenseService.remove(req.accessToken!, req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
