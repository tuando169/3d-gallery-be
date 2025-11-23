import { Router } from 'express';
import multer from 'multer';
import { RoomController } from '../../controllers/roomController';
import { AuthGuard } from '../../middleware/authGuard';

const router = Router();

const upload = multer();

router.get('/', RoomController.getAll);
router.get('/:id', RoomController.getOne);

router.post(
  '/',
  AuthGuard.verifyToken,
  upload.single('room_json'),
  RoomController.create
);

router.put(
  '/',
  AuthGuard.verifyToken,
  upload.single('room_json'),
  RoomController.update
);

router.delete('/', AuthGuard.verifyToken, RoomController.remove);

export default router;
