import { Router } from 'express';
import multer from 'multer';
import { TextureController } from './textureController';

const router = Router();

const OK_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/ktx2',
  'application/octet-stream',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!OK_TYPES.has(file.mimetype)) {
      return cb(new Error('Only png/jpg/jpeg/webp/ktx2 are allowed'));
    }
    cb(null, true);
  },
}).fields([
  { name: 'alb', maxCount: 1 },
  { name: 'nor', maxCount: 1 },
  { name: 'orm', maxCount: 1 },
]);

router.get('/', TextureController.getAll);
router.get('/:id', TextureController.getOne);
router.post('/', upload, TextureController.create);
router.patch('/:id', upload, TextureController.update);
router.delete('/:id', TextureController.delete);

export default router;
