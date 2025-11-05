// routes/object3d.js
import { Router } from 'express';
import * as c from '../controllers/object3d.controller.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();
r.use(requireAuth);

r.get('/', c.list);
r.post('/', c.uploadModel, c.create);       // <— thêm middleware nhận file
r.patch('/:id', c.uploadModel, c.update);    // <— hỗ trợ thay file
r.delete('/:id', c.remove);

export default r;
