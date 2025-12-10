import { Router } from 'express';
import { AuthController } from './authController';
import { AuthGuard } from '../../middleware/authGuard';

const authRoutes = Router();

authRoutes.post('/signup', AuthController.signup);
authRoutes.post('/login', AuthController.login);
authRoutes.post('/refresh', AuthController.refresh);

authRoutes.post('/logout', AuthGuard.verifyToken, AuthController.logout);

export default authRoutes;
