import type { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';

const TABLE = 'users';

export const UserController = {
  /** GET /users */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supabaseService.findMany(
        req.accessToken!,
        TABLE,
        '*',
        (q: any) => q
      );

      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  /** GET /users/:id */
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await supabaseService.findById(
        req.accessToken!,
        TABLE,
        req.params.id
      );

      if (!data) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  /** POST /users */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const newUser = await supabaseService.create(
        req.accessToken!,
        TABLE,
        req.body
      );

      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /users/:id */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await supabaseService.updateById(
        req.accessToken!,
        TABLE,
        req.params.id,
        req.body
      );

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /users/:id */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await supabaseService.deleteById(
        req.accessToken!,
        TABLE,
        req.params.id
      );

      res.json(deleted);
    } catch (err) {
      next(err);
    }
  },
};
