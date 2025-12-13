import { Router } from "express";
import { PaymentController } from "./paymentController";
import { AuthGuard } from "../../middleware/authGuard"; // Import AuthGuard của bạn

const router = Router();

// API tạo link thanh toán (Cần đăng nhập)
router.post("/create-link", AuthGuard.verifyToken, PaymentController.createLink);

// API nhận Webhook (Không cần đăng nhập, PayOS gọi vào)
router.post("/payos-hook", PaymentController.receiveWebhook);

export default router;