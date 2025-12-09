import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './authService';

export const AuthController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);

      const { email, password,name,role } = req.body;
      const data = await AuthService.signup({ email, password, name, role });
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
      const accessToken = req.accessToken;
      const refreshToken = req.body.refresh_token;

      if (!refreshToken)
        throw { status: 400, message: 'No refresh token provided' };

      const data = await AuthService.refresh(refreshToken);
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
