import { Router } from 'express';
import multer from 'multer';
import { AuthGuard } from '../../middleware/authGuard';
import { AudioController } from './audioController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const audioRoutes = Router();

audioRoutes.get('/', AuthGuard.verifyToken, AudioController.getList);
audioRoutes.get('/:id', AuthGuard.verifyToken, AudioController.getOne);

audioRoutes.post(
  '/',
  AuthGuard.verifyToken,
  upload.single('file'),
  AudioController.create
);

audioRoutes.patch('/:id', AuthGuard.verifyToken, AudioController.update);

audioRoutes.delete('/:id', AuthGuard.verifyToken, AudioController.delete);
export default audioRoutes;
