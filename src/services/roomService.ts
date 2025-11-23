import { supabaseAdmin } from "../config/supabase";
import { supabaseService } from "./supabaseService";
import { userService } from "./userService";

const TABLE = "rooms";
const BUCKET = "roomjson";

// =======================
// Helpers
// =======================
function normalizeTags(body: any) {
  if (typeof body.tags === "string") {
    const trimmed = body.tags.trim();
    body.tags = trimmed
      ? trimmed
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
  }
}

// Upload Room JSON buffer lên Supabase Storage
async function uploadRoomJSONToStorage(
  ownerId: string,
  slugOrId: string | number,
  file: Express.Multer.File
) {
  const safeSlug = (slugOrId || "room")
    .toString()
    .replace(/[^a-z0-9-_]/gi, "_")
    .toLowerCase();

  const filename = `${Date.now()}_${safeSlug}.json`;
  const path = `${ownerId}/${filename}`;

  const up = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file.buffer, {
      contentType: "application/json",
      upsert: false,
    });

  if (up.error) throw up.error;

  const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return { path, publicUrl: pub?.publicUrl ?? null };
}

export const RoomService = {
  /** LIST ROOMS */
  async list(token: string | null, page: number, pageSize: number) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const data = token
      ? await supabaseService.listItems(token, TABLE, "*", (q: any) =>
          q.range(from, to)
        )
      : await supabaseService.allItems(TABLE, "*", (q: any) =>
          q.range(from, to)
        );

    // fetch author info
    return await Promise.all(
      data.map(async (room: any) => {
        if (!room.owner_id) return { ...room, author: null };

        const author = await userService
          .getById(room.owner_id)
          .catch(() => null);

        return {
          ...room,
          author: author?.name ?? null,
        };
      })
    );
  },

  /** GET ONE ROOM */
  async getOne(token: string | null, roomId: string) {
    if (token) {
      return await supabaseService.getById(token, TABLE, roomId);
    }

    const rows = await supabaseService.allItems(TABLE, "*", (q: any) =>
      q.eq("id", roomId)
    );
    return rows[0] || null;
  },

  /** CREATE ROOM */
  async create(token: string, body: any, file?: Express.Multer.File) {
    let storageMeta: any = null;

    // Parse JSON file
    if (file) {
      try {
        body.room_json = JSON.parse(file.buffer.toString("utf8"));
      } catch {
        throw { status: 400, message: "room_json file must be valid JSON" };
      }
    }

    // Parse JSON string
    if (!file && body.room_json) {
      try {
        body.room_json = JSON.parse(body.room_json);
      } catch {
        throw { status: 400, message: "room_json string must be valid JSON" };
      }
    }

    normalizeTags(body);

    const created = await supabaseService.insertItem(token, TABLE, body);

    // (optional) upload JSON file to storage
    // if (file) {
    //   const ownerId = body.owner_id || created.owner_id;
    //   const slug = created.slug || created.id;
    //   storageMeta = await uploadRoomJSONToStorage(ownerId, slug, file);
    // }

    return { ...created, __storage: storageMeta };
  },

  /** UPDATE ROOM */
  async update(
    token: string,
    roomId: string,
    body: any,
    file?: Express.Multer.File,
    ownerId?: string
  ) {
    let storageMeta: any = null;

    // Parse new JSON file
    if (file) {
      try {
        body.room_json = JSON.parse(file.buffer.toString("utf8"));
      } catch {
        throw { status: 400, message: "room_json file must be valid JSON" };
      }
    }

    normalizeTags(body);

    const updated = await supabaseService.updateById(
      token,
      TABLE,
      roomId,
      body
    );

    // Upload JSON to storage if needed
    if (file) {
      const id = ownerId ?? updated.owner_id;
      const slug = updated.slug || updated.id;
      storageMeta = await uploadRoomJSONToStorage(id, slug, file);
    }

    return { ...updated, __storage: storageMeta };
  },

  /** DELETE ROOMS */
  async remove(token: string, roomIds: string[]) {
    for (const id of roomIds) {
      await supabaseService.deleteById(token, TABLE, id);
    }
    return { ok: true, deleted: roomIds.length };
  },
};
