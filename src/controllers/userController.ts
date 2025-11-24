import type { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

export const UserController = {
  /** GET /users?page=&pageSize= */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.getAll();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  /** GET /users/:id */
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  /** POST /users */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await userService.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /users/:id */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await userService.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /users/:id */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await userService.remove(req.params.id);
      res.json(deleted);
    } catch (err) {
      next(err);
    }
  },
};
