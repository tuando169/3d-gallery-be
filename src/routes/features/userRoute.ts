import { Router } from 'express';
import { AuthGuard } from '../../middleware/authGuard';
import { UserController } from '../../controllers/userController';

const r = Router();
r.use(AuthGuard.verifyToken);

r.get('/', UserController.getAll);
r.get('/:id', UserController.getOne);
r.post('/', UserController.create);
r.patch('/:id', UserController.update);
r.delete('/:id', UserController.remove);

export default r;
