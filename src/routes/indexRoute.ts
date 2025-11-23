import { Router } from 'express';
import authRoutes from './features/authRoute';
import imageRoutes from './features/imageRoute';
import newsRoutes from './features/newsRoute';
import object3dRoutes from './features/object3dRoute';
import roomRoutes from './features/roomRoute';
import userRoutes from './features/userRoute';

const router = Router();

router.get('/', (req, res) => {
  res.send('Running');
});

router.use('/auth', authRoutes);
router.use('/image', imageRoutes);
router.use('/news', newsRoutes);
router.use('/object3d', object3dRoutes);
router.use('/room', roomRoutes);
router.use('/user', userRoutes);

export default router;
