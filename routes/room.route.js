import { Router } from 'express';
import * as c from '../controllers/room.controller.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';

const r = Router();
const upload = multer(); // parse multipart/form-data

r.get('/', c.getAll);
r.get('/:id', c.getOne);

// Cho phép gửi form-data có file field tên "room_json"
r.post('/', requireAuth, upload.single('room_json'), c.create);

// Cho phép update với file "room_json" nếu có
r.put('/', requireAuth, upload.single('room_json'), c.update);

r.delete('/', requireAuth, c.remove);

export default r;
