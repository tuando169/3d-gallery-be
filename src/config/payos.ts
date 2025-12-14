import { config } from './env';

const PayOSLib = require("@payos/node");
const PayOS = PayOSLib.PayOS || PayOSLib.default || PayOSLib;

const payos = new PayOS({
    clientId: config.payos.clientId,
    apiKey: config.payos.apiKey,
    checksumKey: config.payos.checksumKey,
});

export default payos;