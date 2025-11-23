import { Router } from 'express';
import multer from 'multer';
import { AuthGuard } from '../../middleware/authGuard';
import { ImageController } from '../../controllers/imageController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const imageRoutes = Router();

imageRoutes.get('/', AuthGuard.verifyToken, ImageController.list);

imageRoutes.post(
  '/',
  AuthGuard.verifyToken,
  upload.single('file'),
  ImageController.create
);

imageRoutes.patch('/:id', AuthGuard.verifyToken, ImageController.update);

imageRoutes.delete('/', AuthGuard.verifyToken, ImageController.remove);
export default imageRoutes;
