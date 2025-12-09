import { Router } from "express";
import multer from "multer";
import { RoomController } from "../../modules/room/roomController";
import { AuthGuard } from "../../middleware/authGuard";

const router = Router();

const upload = multer();

router.get("/public", RoomController.getPublic);
router.get("/", AuthGuard.verifyToken, RoomController.getList);
router.get("/template", AuthGuard.verifyToken, RoomController.getTemplateList);

router.get("/:id", AuthGuard.verifyToken, RoomController.getOne);

router.post(
  "/",
  AuthGuard.verifyToken,
  upload.single("thumbnail"),
  RoomController.create
);

router.post(
  "/buy-template",
  AuthGuard.verifyToken,
  RoomController.buyTemplates
);

router.patch(
  "/:id",
  AuthGuard.verifyToken,
  upload.single("thumbnail"),
  RoomController.update
);

router.delete("/:id", AuthGuard.verifyToken, RoomController.delete);

export default router;
