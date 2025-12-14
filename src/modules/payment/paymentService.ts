import { supabaseService } from "../supabase/supabaseService";
import payos from "./payosInstance";

const TABLE_ORDERS = "orders";
const TABLE_LICENSES = "licenses";

export const PaymentService = {
  async createPaymentLink(token: string, userId: string, licenseId: string, returnUrl: string, cancelUrl: string) {
    
    // LOG 1
    console.log("   🚀 [SERVICE] Bắt đầu lấy License...");
    const licenses = await supabaseService.findAllAdmin(TABLE_LICENSES, "*", (q: any) => q.eq("id", licenseId));
    if (!licenses || licenses.length === 0) throw new Error("Gói dịch vụ không tồn tại");
    const license = licenses[0];

    // Tạo mã đơn hàng
    const orderCode = Number(String(Date.now()).slice(-6));

    // LOG 2
    console.log("   🚀 [SERVICE] Đang tạo Order trên Supabase...");
    const orderRecord = {
      user_id: userId,
      license_id: licenseId,
      order_code: orderCode,
      amount: license.price,
      status: "PENDING",
      description: `Mua goi ${license.title}`
    };
    
    // Ghi vào DB
    await supabaseService.create(token, TABLE_ORDERS, orderRecord); 

    // LOG 3
    console.log("   🚀 [SERVICE] Đang gọi PayOS API...");
    const paymentData = {
      orderCode: orderCode,
      amount: license.price,
      description: `Thanh toan don ${orderCode}`,
      items: [
        {
          name: license.title,
          quantity: 1,
          price: license.price
        }
      ],
      returnUrl: returnUrl,
      cancelUrl: cancelUrl
    };

    // [QUAN TRỌNG] Dùng hàm paymentRequests.create
    // @ts-ignore
    const paymentLinkResponse = await payos.paymentRequests.create(paymentData);
    
    console.log("   ✅ [SERVICE] Đã có Link:", paymentLinkResponse.checkoutUrl);
    
    return {
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      orderCode: orderCode
    };
  },

  async handleWebhook(webhookData: any) {
    // ... Giữ nguyên phần webhook ...
    return true;
  }
};