import { Router } from 'express';
import multer from 'multer';
import * as c from '../controllers/auth.controller.js';

const r = Router();
const upload = multer(); // parse multipart/form-data (text fields)

r.post('/signup',  upload.none(), c.signup);
r.post('/login',   upload.none(), c.login);
r.post('/refresh', upload.none(), c.refresh);
r.post('/logout',  c.logout); // logout chỉ đọc Bearer token ở header, không cần body

export default r;
