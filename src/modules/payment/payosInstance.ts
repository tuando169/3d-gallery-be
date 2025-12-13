// src/modules/payment/payosInstance.ts

const PayOSLib = require("@payos/node");
const PayOS = PayOSLib.PayOS || PayOSLib.default || PayOSLib;

// SỬA Ở ĐÂY: Truyền vào một Object có đầy đủ tên thuộc tính
const payos = new PayOS({
    clientId:     "cb0c463f-1810-4854-a37f-e4a2c0cb58a1", 
    apiKey:       "53d10a6f-946a-42b8-8471-487969390b15", 
    checksumKey:  "58c79b2af906e3646c3cdf6629c04489d530960c3dadd3d27cf057146009a432"
});

export default payos;