import express, { Request, Response } from "express";
import path from "path";

// --- IMPORT PAYOS AN TOÀN TRONG TYPESCRIPT ---
// Dùng require để đảm bảo lấy được đúng Class dù thư viện đóng gói kiểu gì
const PayOSLib = require("@payos/node");
const PayOS = PayOSLib.PayOS || PayOSLib.default || PayOSLib;

const app = express();

// --- CẤU HÌNH PAYOS (BẠN PHẢI THAY KEY MỚI VÀO ĐÂY) ---
// Lưu ý: Lỗi 201 (Signature invalid) chỉ hết khi bạn tạo Key mới trên web và dán vào đây
const payos = new PayOS({
    clientId:     "cb0c463f-1810-4854-a37f-e4a2c0cb58a1", 
    apiKey:       "53d10a6f-946a-42b8-8471-487969390b15", 
    checksumKey:  "58c79b2af906e3646c3cdf6629c04489d530960c3dadd3d27cf057146009a432"
});

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Định nghĩa kiểu dữ liệu cho Body gửi lên (Optional, giúp code xịn hơn)
interface PaymentBody {
    amount: number;
    description: string;
    orderCode?: number;
    cancelUrl?: string;
    returnUrl?: string;
}

app.post("/tao-link-thanh-toan", async (req: Request, res: Response) => {
    // Tạo mã đơn hàng ngẫu nhiên
    const orderCode = Number(String(Date.now()).slice(-6));
    
    const requestData: PaymentBody = {
        orderCode: orderCode,
        amount: 2000,
        description: "Test PayOS TS",
        cancelUrl: "http://localhost:3000/",
        returnUrl: "http://localhost:3000/",
    };

    try {
        // Gọi hàm tạo link (dùng paymentRequests.create như đã fix)
        const paymentLinkResponse = await payos.paymentRequests.create(requestData);
        
        res.json({ checkoutUrl: paymentLinkResponse.checkoutUrl });
    } catch (error: any) {
        console.error("Lỗi:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server TypeScript đang chạy tại: http://localhost:${PORT}`);
});