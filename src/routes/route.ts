import { Router } from 'express';
import authRoutes from '../modules/auth/authRoute';
import imageRoutes from '../modules/image/imageRoute';
import newsRoutes from '../modules/news/newsRoute';
import object3dRoutes from '../modules/object3d/object3dRoute';
import roomRoutes from '../modules/room/roomRoute';
import userRoutes from '../modules/user/userRoute';
import textureRoutes from '../modules/texture/textureRoute';
import audioRoutes from '../modules/audio/audioRoute';

const router = Router();

router.get('/', (req, res) => {
  res.send('Running');
});

router.use('/auth', authRoutes);
router.use('/image', imageRoutes);
router.use('/audio', audioRoutes);
router.use('/news', newsRoutes);
router.use('/object3d', object3dRoutes);
router.use('/room', roomRoutes);
router.use('/user', userRoutes);
router.use('/texture', textureRoutes);

export default router;
