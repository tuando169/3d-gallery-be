import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./paymentService";
import payos from "./payosInstance";

export const PaymentController = {
  async createLink(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Lấy dữ liệu
      const { licenseId } = req.body;
      let { returnUrl, cancelUrl } = req.body;
      
      const userId = req.user?.id;
      
      // [FIX] Lấy token an toàn từ Header (Phòng trường hợp req.accessToken bị null)
      let token = req.accessToken;
      if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
          token = parts[1];
        }
      }

      // Default URL nếu thiếu
      if (!returnUrl) returnUrl = "http://localhost:5173/manage-space";
      if (!cancelUrl) returnUrl = "http://localhost:5173";

      console.log("👉 [CONTROLLER] Data:", { 
        userId, 
        hasToken: !!token, 
        licenseId,
        returnUrl 
      });

      if (!userId || !token) {
        throw new Error(`Dữ liệu không hợp lệ: User=${userId}, Token=${!!token}`);
      }

      // 2. Gọi Service
      console.log("👉 [CONTROLLER] Đang gọi Service...");
      const data = await PaymentService.createPaymentLink(token, userId, licenseId, returnUrl, cancelUrl);
      
      console.log("✅ [CONTROLLER] Thành công!");
      res.json(data);

    } catch (err) {
      console.error("❌ [LỖI TẠI CONTROLLER]:", err);
      // Trả lỗi chi tiết về Frontend để dễ debug (chỉ dùng khi dev)
      res.status(500).json({ 
        message: "Lỗi Server", 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  },

  async receiveWebhook(req: Request, res: Response) {
    try {
      const webhookData = payos.verifyPaymentWebhookData(req.body);
      await PaymentService.handleWebhook(webhookData);
      res.json({ success: true });
    } catch (err) {
      console.error("Lỗi Webhook:", err);
      res.json({ success: false }); 
    }
  }
};