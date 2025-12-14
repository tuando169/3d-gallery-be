import payos from "../../config/payos";
import { supabaseService } from "../supabase/supabaseService";
import { getUserFromToken } from "../../util";
import { OrderModel, OrderUploadModel } from "./paymentModel";
import { LicenseService } from "../license/licenseService";
import { UserService } from "../user/userService";
import { RoomService } from "../room/roomService";

const TABLE_ORDERS = "orders";

export const PaymentService = {
  async createPaymentLink(
    token: string,
    licenseId: string,
    returnUrl: string,
    cancelUrl: string
  ) {
    // LOG 1
    console.log("   🚀 [SERVICE] Bắt đầu lấy License...");
    const user = await getUserFromToken(token);
    const userId = user.user?.id;
    if (!userId) throw new Error("User không hợp lệ");

    const license = await LicenseService.getOne(licenseId);
    if (!license) {
      throw new Error("License không tồn tại");
    }
    const orderPayload: OrderUploadModel = {
      user_id: userId,
      order_code: 0,
      amount: license?.price || 0,
      reference_id: licenseId,
      type: 'license',
      status: 'pending',
      description: `Mua license: ${license?.title || ''}`,
    };
    // LOG 2 – Tạo order
    const order = await this.createOrder(orderPayload);

    // LOG 3 – Gọi PayOS
    console.log("   🚀 [SERVICE] Đang gọi PayOS API...");

    const paymentData = {
      orderCode: order.orderCode,
      amount: order.amount,
      description: `LIC ${order.orderCode}`,
      items: [
        {
          name: license.title,
          quantity: 1,
          price: license.price,
        },
      ],
      returnUrl,
      cancelUrl,
    };
    console.log(paymentData);


    const paymentLinkResponse = await payos.paymentRequests.create(paymentData);

    console.log(
      "   ✅ [SERVICE] Đã có Link:",
      paymentLinkResponse.checkoutUrl
    );

    return {
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      orderCode: order.orderCode,
    };
  },

  async buyTemplate(
    token: string,
    templateId: string,
    returnUrl: string,
    cancelUrl: string
  ) {
    /**
     * 1️⃣ Lấy user từ token
     */
    const user = await getUserFromToken(token);
    const userId = user.user?.id;
    if (!userId) {
      throw new Error("User không hợp lệ");
    }

    /**
     * 2️⃣ Lấy template
     */
    const templates = await RoomService.getPublicTemplateList();
    console.log(templates);
    console.log(templateId);

    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      throw new Error("Template không tồn tại");
    }

    const existed = await supabaseService.findAllAdmin(
      "orders",
      "*",
      (q: any) =>
        q
          .eq("user_id", userId)
          .eq("reference_id", templateId)
          .eq("type", "template")
          .eq("status", "completed")
    );

    if (existed && existed.length > 0) {
      throw new Error("Bạn đã mua template này rồi");
    }

    /**
     * 4️⃣ Tạo order (PENDING)
     */
    const orderPayload: OrderUploadModel = {
      user_id: userId,
      amount: template.price || 0,
      reference_id: templateId,
      type: "template",
      status: "pending",
      description: `Mua template: ${template.title}`,
      order_code: 0,
    };

    const order = await this.createOrder(orderPayload);

    /**
     * 5️⃣ Tạo PayOS payment link
     */
    const paymentData = {
      orderCode: order.orderCode,
      amount: order.amount,
      description: `TPL ${order.orderCode}`, // <= 25 ký tự
      items: [
        {
          name: template.title,
          quantity: 1,
          price: template.price,
        },
      ],
      returnUrl,
      cancelUrl,
    };

    const paymentLinkResponse =
      await payos.paymentRequests.create(paymentData);

    return {
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      orderCode: order.orderCode,
    };
  },

  async handlePaymentWebhook(webhookData: any) {
    console.log("🔔 [WEBHOOK] PayOS payload:", webhookData);

    const { orderCode, status, amount } = webhookData.data;

    /**
     * 2️⃣ Chỉ xử lý khi thanh toán thành công
     */
    if (status !== "PAID") {
      console.log(
        `ℹ️ [WEBHOOK] Bỏ qua trạng thái ${status} (orderCode=${orderCode})`
      );
      return { success: true };
    }

    /**
     * 3️⃣ Lấy order theo order_code
     */
    const orders = await supabaseService.findAllAdmin(
      TABLE_ORDERS,
      "*",
      (q: any) => q.eq("order_code", orderCode)
    );

    if (!orders || orders.length === 0) {
      console.error("❌ [WEBHOOK] Không tìm thấy order:", orderCode);
      throw new Error("Order not found");
    }

    const order: OrderModel = orders[0];

    /**
     * 4️⃣ Idempotent – đã xử lý rồi thì bỏ qua
     */
    if (order.status === "completed") {
      console.log(
        `✅ [WEBHOOK] Order ${orderCode} đã COMPLETED trước đó`
      );
      return { success: true };
    }

    /**
     * 5️⃣ Validate số tiền
     */
    if (order.amount !== amount) {
      console.error(
        `❌ [WEBHOOK] Amount mismatch: db=${order.amount}, webhook=${amount}`
      );
      throw new Error("Amount mismatch");
    }

    /**
     * 6️⃣ Update order → completed
     */
    const updatedOrder: OrderModel = {
      ...order,
      status: "completed",
    };

    await this.updateOrder(updatedOrder);

    console.log(`🎉 [WEBHOOK] Order ${orderCode} COMPLETED`);

    /**
     * 7️⃣ Xử lý business theo type
     */
    switch (order.type) {
      case "license":
        await UserService.update(order.user_id, {
          license: order.reference_id,
        });
        break;

      case "template":
        await RoomService.buyTemplateByUserId(order.user_id, {
          template_id: order.reference_id!,
        });
        break;

      default:
        console.warn(
          `⚠️ [WEBHOOK] Unknown order type: ${order.type}`
        );
    }

    return { success: true };
  },

  async createOrder(
    order: OrderUploadModel
  ) {
    // Tạo mã đơn hàng
    const orderCode = Number(
      `${Date.now()}${Math.floor(Math.random() * 1000)}`
    );
    order.order_code = orderCode;
    await supabaseService.insertAdmin(TABLE_ORDERS, order);
    return {
      orderCode,
      amount: order.amount,
      description: order.description,
    };
  },
  async updateOrder(
    order: OrderModel
  ) {
    await supabaseService.updateByIdAdmin(TABLE_ORDERS, order.id, order);
    return order;
  }

};