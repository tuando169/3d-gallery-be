import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../../controllers/authController';

const upload = multer();

const authRoutes = Router();

authRoutes.post('/signup', upload.none(), AuthController.signup);
authRoutes.post('/login', upload.none(), AuthController.login);
authRoutes.post('/refresh', upload.none(), AuthController.refresh);

authRoutes.post('/logout', AuthController.logout);

export default authRoutes;
