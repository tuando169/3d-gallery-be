import path from 'node:path';
import multer from 'multer';
import * as supabaseService from '../services/supabaseService.js';
import { supabaseAdmin } from '../config/supabase.js';

// Multer: nhận file .glb từ field 'model'
const storage = multer.memoryStorage();
const MAX_SIZE = 200 * 1024 * 1024; // 200MB

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const ok =
    ext === '.glb' &&
    (file.mimetype === 'model/gltf-binary' ||
      file.mimetype === 'application/octet-stream');
  if (!ok) return cb(new Error('Only .glb is allowed (model/gltf-binary).'));
  cb(null, true);
};
export const uploadModel = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
}).single('model');

export const list = async (req, res, next) => {
  try {
    const data = await supabaseService.listItems(
      req.accessToken,
      'object3d',
      '*',
      (q) => q
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    // 1) Validate file
    if (!req.file) {
      const e = new Error('Missing file: field "model" must be a .glb');
      e.status = 400;
      throw e;
    }

    // 2) Owner: lấy từ auth middleware (ưu tiên), fallback body
    const owner_id = req.user?.id || req.body.owner_id;
    if (!owner_id) {
      const e = new Error(
        'owner_id is required (or login to set it from token)'
      );
      e.status = 400;
      throw e;
    }

    // 3) Upload lên Supabase Storage (bucket: object3d)
    const filename = `${Date.now()}_${req.file.originalname.replace(
      /\s+/g,
      '_'
    )}`;
    const filepath = `${owner_id}/${filename}`;

    const up = await supabaseAdmin.storage
      .from('object3d')
      .upload(filepath, req.file.buffer, {
        contentType: 'model/gltf-binary',
        upsert: false,
      });

    if (up.error) throw up.error;

    // 4) Lấy URL (nếu bucket public: dùng publicUrl; nếu private: có thể đổi sang signed URL)
    const { data: pub } = supabaseAdmin.storage
      .from('object3d')
      .getPublicUrl(filepath);
    const file_url = pub?.publicUrl || filepath;

    // 5) Chuẩn hóa các field còn lại
    const payload = {
      owner_id,
      room_id: req.body.room_id || null,
      file_url,
      poly_count: req.body.poly_count ? Number(req.body.poly_count) : null,
      bounds: req.body.bounds ? JSON.parse(req.body.bounds) : null,
      source_type: req.body.source_type || 'upload',
    };

    // 6) Lưu vào bảng object3d
    const data = await supabaseService.insertItem(
      req.accessToken,
      'object3d',
      payload
    );

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const changes = { ...req.body };
    if (changes.poly_count) changes.poly_count = Number(changes.poly_count);
    if (changes.bounds && typeof changes.bounds === 'string') {
      changes.bounds = JSON.parse(changes.bounds);
    }

    // Nếu có file mới -> upload và cập nhật file_url
    if (req.file) {
      const owner_id = req.user?.id || req.body.owner_id;
      const filename = `${Date.now()}_${req.file.originalname.replace(
        /\s+/g,
        '_'
      )}`;
      const filepath = `${owner_id}/${filename}`;
      const up = await supabaseAdmin.storage
        .from('object3d')
        .upload(filepath, req.file.buffer, {
          contentType: 'model/gltf-binary',
          upsert: false,
        });
      if (up.error) throw up.error;

      const { data: pub } = supabaseAdmin.storage
        .from('object3d')
        .getPublicUrl(filepath);
      const file_url = pub?.publicUrl || filepath;
    }

    const data = await supabaseService.updateById(
      req.accessToken,
      'object3d',
      req.params.id,
      changes
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const data = await supabaseService.deleteById(
      req.accessToken,
      'object3d',
      req.params.id
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};
