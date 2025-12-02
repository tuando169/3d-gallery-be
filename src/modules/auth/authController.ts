import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export const AuthController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.signup({ email, password });
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.login({ email, password });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = req.body;
      const data = await AuthService.refresh({ refresh_token });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring('Bearer '.length)
        : null;

      const data = await AuthService.logout(token!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
