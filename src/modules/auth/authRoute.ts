import { Router } from 'express';
import { AuthController } from './authController';
import { AuthGuard } from '../../middleware/authGuard';
import multer from 'multer';

const authRoutes = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
authRoutes.post('/signup',
    upload.single('avatar'), AuthController.signup);

authRoutes.post('/login', AuthController.login);

authRoutes.post('/refresh', AuthController.refresh);

authRoutes.post('/logout', AuthGuard.verifyToken, AuthController.logout);

export default authRoutes;
