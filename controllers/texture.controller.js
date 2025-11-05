// controllers/textures.js
import path from 'node:path';
import multer from 'multer';
import * as supabaseService from '../services/supabaseService.js';
import { getUserIdFromToken, supabaseAdmin } from '../config/supabase.js';
import { log } from 'node:console';

const BUCKET = 'textures';
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

// Cho phép png/jpg/jpeg/webp/ktx2
const OK_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/ktx2',
  'application/octet-stream', // 1 số tool up ktx2 sẽ dùng type này
]);

const storage = multer.memoryStorage();
const fileFilter = (_req, file, cb) => {
  if (!OK_TYPES.has(file.mimetype)) {
    return cb(new Error('Only png/jpg/jpeg/webp/ktx2 are allowed'));
  }
  cb(null, true);
};

// Nhận 3 field file: albedo, normal, orm (mỗi field tối đa 1 file)
export const uploadTextures = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
}).fields([
  { name: 'alb', maxCount: 1 }, // color/albedo/baseColor
  { name: 'nor', maxCount: 1 },
  { name: 'orm', maxCount: 1 }, // occlusion-roughness-metallic (packed)
]);
export const get = async (req, res, next) => {
  try {
    const { texture_id, page = 1, page_size = 10 } = req.query;
    const hasToken = !!req.accessToken;

    const p = Number(page);
    const s = Number(page_size);
    const from = (p - 1) * s;
    const to = from + s - 1;

    // ========= GET ONE =========
    if (texture_id) {
      if (!hasToken) {
        const data = await supabaseService
          .allItems('textures', '*', (q) => q.eq('id', texture_id))
          .then((arr) => arr[0] || null);
        return res.json(data);
      }

      const data = await supabaseService.getById(req.accessToken, 'textures', texture_id);
      return res.json(data);
    }

    // ========= GET ALL (NO TOKEN) =========
    if (!hasToken) {
      const data = await supabaseService.allItems(
        'textures',
        '*',
        (q) => q.range(from, to) // <= PAGINATION
      );
      return res.json(data);
    }

    // ========= GET ALL (WITH TOKEN / RLS) =========
    const data = await supabaseService.listItems(
      req.accessToken,
      'textures',
      '*',
      (q) => q.range(from, to) // <= PAGINATION
    );

    return res.json(data);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const name = req.body.title || 'Untitled Texture';
    const owner_id = await getUserIdFromToken(req);
    const object3d_id = req.body.texture_for;

    if (!owner_id) {
      const e = new Error(
        'owner_id is required (or login to set it from token)'
      );
      e.status = 400;
      throw e;
    }
    if (!object3d_id) {
      const e = new Error('object3d_id is required');
      e.status = 400;
      throw e;
    }

    // Phải có ít nhất 1 file (albedo/normal/orm) hoặc bạn tự truyền URL sẵn
    const hasAnyFile =
      req.files?.alb?.[0] || req.files?.nor?.[0] || req.files?.orm?.[0];
    const hasAnyUrl = req.body.alb_url || req.body.nor_url || req.body.orm_url;
    if (!hasAnyFile && !hasAnyUrl) {
      const e = new Error(
        'Provide at least one file (albedo/normal/orm) or *_url'
      );
      e.status = 400;
      throw e;
    }

    // Helper upload
    const uploadOne = async (file, mapName) => {
      if (!file) return null;
      const clean = file.originalname.replace(/\s+/g, '_');
      const ext = path.extname(clean).toLowerCase();
      const filename = `${Date.now()}_${mapName}${ext}`;
      const filepath = `${owner_id}/${object3d_id}/${filename}`;

      const up = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filepath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (up.error) throw up.error;

      const { data: pub } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(filepath);
      return pub?.publicUrl || filepath;
    };

    const alb_url =
      req.body.alb_url || (await uploadOne(req.files?.alb?.[0], 'albedo'));
    const nor_url =
      req.body.nor_url || (await uploadOne(req.files?.nor?.[0], 'normal'));
    const orm_url =
      req.body.orm_url || (await uploadOne(req.files?.orm?.[0], 'orm'));

    const payload = {
      name: name,
      owner_id,
      object3d_id,
      alb_url: alb_url || null,
      nor_url: nor_url || null,
      orm_url: orm_url || null,
    };

    const data = await supabaseService.insertItem(req.accessToken, 'textures', payload);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const changes = {
      name: req.body.title,
      // Cho phép update URL trực tiếp nếu muốn
      alb_url: req.body.alb_url ?? undefined,
      nor_url: req.body.nor_url ?? undefined,
      orm_url: req.body.orm_url ?? undefined,
    };

    const owner_id = await getUserIdFromToken(req);
    const object3d_id = req.body.texture_for; // optional khi update

    const uploadOne = async (file, mapName) => {
      if (!file) return null;
      const clean = file.originalname.replace(/\s+/g, '_');
      const ext = path.extname(clean).toLowerCase();
      const filename = `${Date.now()}_${mapName}${ext}`;
      const prefix = owner_id ? `${owner_id}/` : '';
      const objPart = object3d_id ? `${object3d_id}/` : '';
      const filepath = `${prefix}${objPart}${filename}`;

      const up = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filepath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (up.error) throw up.error;

      const { data: pub } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(filepath);
      return pub?.publicUrl || filepath;
    };

    if (req.files?.albedo?.[0])
      changes.alb_url = await uploadOne(req.files.alb[0], 'albedo');
    if (req.files?.normal?.[0])
      changes.nor_url = await uploadOne(req.files.nor[0], 'normal');
    if (req.files?.orm?.[0])
      changes.orm_url = await uploadOne(req.files.orm[0], 'orm');

    const data = await supabaseService.updateById(
      req.accessToken,
      'textures',
      req.query.texture_id,
      changes
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * Xóa một hoặc nhiều texture
 * @param {string|string[]} textureIds - ID hoặc mảng ID của texture cần xóa
 */
/**
 * DELETE /texture
 * Body: { ids: ["id1","id2",...] }
 */
export const remove = async (req, res, next) => {
  try {
    const ids = req.body.texture_ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      const e = new Error('Provide ids array in body: { ids: [...] }');
      e.status = 400;
      throw e;
    }

    // gọi supabaseService.deleteById cho từng id
    for (const id of ids) {
      await supabaseService.deleteById(req.accessToken, 'textures', id);
    }

    res.json({ ok: true, deleted: ids.length });
  } catch (err) {
    next(err);
  }
};
