// controllers/rooms.js
import * as supabaseService from '../services/supabaseService.js';
import { getUserIdFromToken, supabaseAdmin } from '../config/supabase.js'; // NEW

const BUCKET = 'roomjson';

// Helper: nếu body.tags là chuỗi "a, b, c" -> ["a","b","c"]
function normalizeTags(body) {
  if (typeof body.tags === 'string') {
    const trimmed = body.tags.trim();
    body.tags = trimmed
      ? trimmed
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }
}

// Upload buffer JSON lên Supabase Storage, trả { path, publicUrl }
async function uploadRoomJSONToStorage(owner_id, slugOrId, file) {
  // file: Multer file { originalname, buffer, mimetype... }
  const safeSlug = (slugOrId || 'room')
    .toString()
    .replace(/[^a-z0-9-_]/gi, '_')
    .toLowerCase();
  const filename = `${Date.now()}_${safeSlug}.json`;
  const filepath = `${owner_id}/${filename}`;

  const up = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filepath, file.buffer, {
      contentType: 'application/json',
      upsert: false,
    });

  if (up.error) throw up.error;

  const { data: pub } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(filepath);
  return { path: filepath, publicUrl: pub?.publicUrl || null };
}

export const get = async (req, res, next) => {
  try {
    const { room_id, page = 1, page_size = 10 } = req.query;
    const hasToken = !!req.accessToken;

    const p = Number(page);
    const s = Number(page_size);
    const from = (p - 1) * s;
    const to = from + s - 1;

    // ========= GET ONE by id =========
    if (room_id) {
      if (!hasToken) {
        // no token -> admin
        const data = await supabaseService
          .allItems('rooms', '*', (q) => q.eq('id', room_id))
          .then((arr) => arr[0] || null);
        return res.json(data);
      }

      // with token -> RLS
      const data = await supabaseService.getById(
        req.accessToken,
        'rooms',
        room_id
      );
      return res.json(data);
    }

    // ========= GET ALL (NO TOKEN) =========
    if (!hasToken) {
      const data = await supabaseService.allItems('rooms', '*', (q) =>
        q.range(from, to)
      );
      return res.json(data);
    }

    // ========= GET ALL (WITH TOKEN / RLS) =========
    const data = await supabaseService.listItems(
      req.accessToken,
      'rooms',
      '*',
      (q) => q.range(from, to)
    );

    return res.json(data);
  } catch (err) {
    next(err);
  }
};
export const create = async (req, res, next) => {
  try {
    let storageMeta = null;

    // ====== ƯU TIÊN file nếu có ======
    if (req.file) {
      try {
        const text = req.file.buffer.toString('utf8');
        req.body.room_json = JSON.parse(text);
      } catch (e) {
        e.status = 400;
        e.message = 'room_json file must be valid JSON';
        throw e;
      }
    }

    // ====== Nếu không có file nhưng có room_json dạng text từ body ======
    if (!req.file && req.body.room_json) {
      try {
        // room_json là string => parse về object
        req.body.room_json = JSON.parse(req.body.room_json);
      } catch (e) {
        e.status = 400;
        e.message = 'room_json string in body must be valid JSON';
        throw e;
      }
    }

    // Vì tags gửi dạng string
    normalizeTags(req.body);

    // Insert DB
    const created = await supabaseService.insertItem(
      req.accessToken,
      'rooms',
      req.body
    );

    // Upload bản gốc vào storage nếu có file upload
    if (req.file) {
      const owner_id = await getUserIdFromToken(req);
      if (owner_id) {
        const slugOrId = created?.slug || created?.id;
        storageMeta = await uploadRoomJSONToStorage(
          owner_id,
          slugOrId,
          req.file
        );
      }
    }

    res.status(201).json({
      ...created,
      __storage: storageMeta,
    });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    let storageMeta = null;

    if (req.file) {
      try {
        const text = req.file.buffer.toString('utf8');
        req.body.room_json = JSON.parse(text);
      } catch (e) {
        e.status = 400;
        e.message = 'room_json file must be valid JSON';
        throw e;
      }
    }

    normalizeTags(req.body);

    const updated = await supabaseService.updateById(
      req.accessToken,
      'rooms',
      req.query.room_id,
      req.body
    );

    // Nếu có file mới, upload bản gốc lên Storage
    if (req.file) {
      const owner_id = await getUserIdFromToken(req);
      if (owner_id) {
        const slugOrId = updated?.slug || updated?.id || req.params.id;
        storageMeta = await uploadRoomJSONToStorage(
          owner_id,
          slugOrId,
          req.file
        );
      }
    }

    res.json({
      ...updated,
      __storage: storageMeta,
    });
  } catch (err) {
    next(err);
  }
};
export const remove = async (req, res, next) => {
  try {
    const ids = req.body.room_ids; // đổi tên đúng với rooms

    if (!Array.isArray(ids) || ids.length === 0) {
      const e = new Error('Provide ids array in body: { room_ids: [...] }');
      e.status = 400;
      throw e;
    }

    for (const id of ids) {
      await supabaseService.deleteById(req.accessToken, 'rooms', id);
    }

    res.json({ ok: true, deleted: ids.length });
  } catch (err) {
    next(err);
  }
};
