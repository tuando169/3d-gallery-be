import { Router } from 'express';
import { AuthGuard } from '../../middleware/authGuard';
import { Object3DController } from '../../controllers/object3dController';
import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.use(AuthGuard.verifyToken);

router.get('/', Object3DController.getAll);

router.post('/', upload.single('file'), Object3DController.create);

router.patch('/:id', upload.single('file'), Object3DController.update);

router.delete('/:id', Object3DController.remove);

export default router;
