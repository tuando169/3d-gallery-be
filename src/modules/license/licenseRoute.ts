import { Router } from "express";
import { AuthGuard } from "../../middleware/authGuard";
import { NewsController } from "./licenseController";
import multer from "multer";

const router = Router();

router.get("/", NewsController.getList);

router.post(
  "/",
  AuthGuard.verifyToken,
  NewsController.create
);

router.patch(
  "/:id",
  AuthGuard.verifyToken,
  NewsController.update
);

router.delete("/:id", AuthGuard.verifyToken, NewsController.remove);

export default router;
