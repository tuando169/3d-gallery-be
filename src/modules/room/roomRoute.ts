import { Router } from 'express';
import multer from 'multer';
import { RoomController } from '../../modules/room/roomController';
import { AuthGuard } from '../../middleware/authGuard';

const router = Router();

const upload = multer();

router.get('/public', RoomController.getPublic);
router.get('/', AuthGuard.verifyToken, RoomController.getList);
router.get('/:id', AuthGuard.verifyToken, RoomController.getOne);

router.post(
  '/',
  AuthGuard.verifyToken,
  upload.single('thumbnail'),
  RoomController.create
);

router.patch(
  '/:id',
  AuthGuard.verifyToken,
  upload.single('thumbnail'),
  RoomController.update
);

router.delete('/:id', AuthGuard.verifyToken, RoomController.remove);

export default router;
