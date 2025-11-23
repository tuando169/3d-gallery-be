// routes/textures.js
import { Router } from "express";
import * as c from "../controllers/texture.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

r.get("/", c.get); // public

r.post("/", requireAuth, c.uploadTextures, c.create);
r.put("/", requireAuth, c.uploadTextures, c.update);
r.delete("/", requireAuth, c.remove);

export default r;
