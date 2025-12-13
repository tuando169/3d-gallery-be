import { Router } from 'express';
import { AuthGuard } from '../../middleware/authGuard';
import { UserController } from './userController';
import multer from 'multer';

const r = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

r.use(AuthGuard.verifyToken);

r.get('/', UserController.getAll);
r.get('/:id', UserController.getOne);
r.post('/', UserController.create);
r.patch('/:id', UserController.update);
r.patch('/:id/avatar', upload.single('file'), UserController.updateAvatar);
r.delete('/:id', UserController.remove);

export default r;
