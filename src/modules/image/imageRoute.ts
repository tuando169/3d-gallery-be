import { Router } from 'express';
import multer from 'multer';
import { AuthGuard } from '../../middleware/authGuard';
import { ImageController } from './imageController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const imageRoutes = Router();

imageRoutes.get('/', AuthGuard.verifyToken, ImageController.getList);
imageRoutes.get('/:id', AuthGuard.verifyToken, ImageController.getOne);

imageRoutes.post(
  '/',
  AuthGuard.verifyToken,
  upload.single('file'),
  ImageController.create
);

imageRoutes.patch('/:id', AuthGuard.verifyToken, ImageController.update);

imageRoutes.delete('/:id', AuthGuard.verifyToken, ImageController.delete);
export default imageRoutes;
