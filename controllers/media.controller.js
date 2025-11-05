// controllers/images.js
import * as supabaseService from '../services/supabaseService.js';

const TABLE = 'images';
const BUCKET = 'images';

// Chỉ giữ đúng các cột hiện có trong schema images
const ALLOWED_DB_FIELDS = new Set([
  'file_url',
  'width',
  'height',
  'title',
  'description',
  'room_id',
  // owner_id, created_at thường do RLS/DEFAULT xử lý; thêm nếu bạn muốn set thủ công
]);

const pickAllowed = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined && v !== null && ALLOWED_DB_FIELDS.has(k)) out[k] = v;
  }
  return out;
};

/** GET /media */
export const list = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.page_size) || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const data = await supabaseService.listItems(
      req.accessToken,
      TABLE,
      '*',
      (q) => q.range(from, to)
    );

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /media
 * - form-data có `file`: upload lên Storage, tạo URL (public hoặc signed tuỳ bucket), insert { file_url, ... }
 * - hoặc không có file nhưng có `file_url`: insert trực tiếp
 */
export const create = async (req, res, next) => {
  try {
    const hasFile = !!req.file;
    const hasDirectUrl = !!req.body?.file_url;

    if (!hasFile && !hasDirectUrl) {
      return res
        .status(400)
        .json({ message: 'Provide a file ("file") or a "file_url".' });
    }

    // Kiểm tra bucket tồn tại
    const exists = await supabaseService.ensureBucketExists(BUCKET);
    if (!exists) {
      return res
        .status(400)
        .json({ message: `Storage bucket "${BUCKET}" does not exist.` });
    }

    // Lấy meta để biết bucket có Public không
    const meta = await supabaseService.getBucketMeta(BUCKET);
    const isPublicBucket = !!meta?.public;

    // Trường hợp có upload file
    if (hasFile) {
      const file = req.file;
      const safeName = (file.originalname || 'upload.bin').replace(
        /[^\w.\-]/g,
        '_'
      );
      const path = `${Date.now()}_${safeName}`;

      // Upload
      await supabaseService.uploadToBucket(
        BUCKET,
        path,
        file.buffer,
        file.mimetype,
        true
      );

      // Lấy URL tuỳ theo bucket Public/Private
      const fileUrl = isPublicBucket
        ? supabaseService.getPublicUrl(BUCKET, path)
        : await supabaseService.createSignedUrl(
            BUCKET,
            path,
            60 * 60 * 24 * 30
          ); // 30 ngày

      // Build payload đúng cột schema
      const base = {
        file_url: fileUrl,
        // width/height nếu bạn muốn set từ client (req.body.width/height)
        // title, description, room_id từ req.body
      };
      const payload = pickAllowed({ ...base, ...req.body });

      const row = await supabaseService.insertItem(
        req.accessToken,
        TABLE,
        payload
      );
      return res.status(201).json(row);
    }

    // Không upload, dùng sẵn file_url
    const payload = pickAllowed(req.body);
    if (!payload.file_url) {
      return res
        .status(400)
        .json({ message: '"file_url" is required when no file is provided.' });
    }
    const row = await supabaseService.insertItem(
      req.accessToken,
      TABLE,
      payload
    );
    return res.status(201).json(row);
  } catch (err) {
    next(err);
  }
};

/** PATCH /media/:id */
export const update = async (req, res, next) => {
  try {
    const patch = pickAllowed(req.body);
    const data = await supabaseService.updateById(
      req.accessToken,
      TABLE,
      req.params.id,
      patch
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/** DELETE /media?media_id=id */
export const remove = async (req, res, next) => {
  try {
    const media_id = req.query.media_id;
    console.log(media_id);
    if (!media_id) throw new Error('media_id is required');

    const data = await supabaseService.deleteById(
      req.accessToken,
      TABLE,
      media_id
    );

    res.json(data);
  } catch (err) {
    next(err);
  }
};
