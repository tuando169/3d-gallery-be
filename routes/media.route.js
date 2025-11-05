// routes/images.js
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import * as c from "../controllers/media.controller.js";

const r = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// List
r.get("/", requireAuth, c.list);

// Create (accepts multipart form-data with `file`, OR JSON with `file_url`)
r.post("/", requireAuth, upload.single("file"), c.create);

// Update / delete
r.patch("/:id", requireAuth, c.update);
r.delete("/", requireAuth, c.remove);

export default r;
