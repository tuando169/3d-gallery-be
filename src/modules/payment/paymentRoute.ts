import { Router } from "express";
import { PaymentController } from "./paymentController";
import { AuthGuard } from "../../middleware/authGuard"; // Import AuthGuard của bạn

const router = Router();

// API tạo link thanh toán (Cần đăng nhập)
router.post("/register-license", AuthGuard.verifyToken, PaymentController.registerLicense);
router.post("/buy-template", AuthGuard.verifyToken, PaymentController.buyTemplate);

router.post("/payos-hook", PaymentController.receiveWebhook);

export default router;