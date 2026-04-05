import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rpcCall } from "../lib/rpc.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const result = await rpcCall("eth_gasPrice");
    const gasPriceWei = parseInt(result, 16);
    const gasPriceGwei = (gasPriceWei / 1e9).toFixed(4);
    res.json({ gasPriceWei, gasPriceGwei });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
