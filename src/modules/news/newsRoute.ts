import { Router } from "express";
import { AuthGuard } from "../../middleware/authGuard";
import { NewsController } from "./newsController";
import multer from "multer";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.get("/", NewsController.getList);

router.post(
  "/",
  AuthGuard.verifyToken,
  upload.any(), // <--- nhận tất cả file trong formData
  NewsController.create
);

router.patch(
  "/:id",
  AuthGuard.verifyToken,
  upload.any(), // <--- nhận tất cả file trong formData
  NewsController.update
);

router.delete("/:id", AuthGuard.verifyToken, NewsController.remove);

export default router;
