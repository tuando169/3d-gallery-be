import { Router } from 'express';
import { AuthGuard } from '../../middleware/authGuard';
import { NewsController } from './newsController';

const router = Router();

// Require login cho tất cả
router.use(AuthGuard.verifyToken);

router.get('/', NewsController.getList);
router.post('/', NewsController.create);
router.patch('/:id', NewsController.update);
router.delete('/:id', NewsController.remove);

export default router;
