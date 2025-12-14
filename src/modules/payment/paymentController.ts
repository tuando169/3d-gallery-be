import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./paymentService";
import payos from "../../config/payos";
import { getUserFromToken } from "../../util";

export const PaymentController = {
  async registerLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const { licenseId } = req.body;
      let { returnUrl, cancelUrl } = req.body;

      // 2. Gọi Service
      console.log("👉 [CONTROLLER] Đang gọi Service...");
      const data = await PaymentService.createPaymentLink(req.accessToken!, licenseId, returnUrl, cancelUrl);

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

  async buyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const templateId = req.body.templateId;
      const { returnUrl, cancelUrl } = req.body;
      const data = await PaymentService.buyTemplate(req.accessToken!, templateId, returnUrl, cancelUrl);
      res.json(data);
    } catch (err) {
      console.error("❌ [LỖI TẠI CONTROLLER]:", err);
      res.status(500).json({
        message: "Lỗi Server",
        error: err instanceof Error ? err.message : String(err)
      });
    }

  },

  async receiveWebhook(req: Request, res: Response) {
    try {
      await PaymentService.handlePaymentWebhook(req.body);
      res.json({ success: true });
    } catch (err) {
      console.error("Lỗi Webhook:", err);
      res.json({ success: false });
    }
  },
};