import { Router } from 'express';
import * as c from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.use(requireAuth);

r.get('/', c.list);
r.post('/', c.create);
r.patch('/:id', c.update);
r.delete('/:id', c.remove);

export default r;
