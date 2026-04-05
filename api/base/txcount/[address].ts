import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rpcCall } from "../../lib/rpc.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const addr = req.query.address as string;
  if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
    return res.status(400).json({ error: "Invalid address format" });
  }
  try {
    const result = await rpcCall("eth_getTransactionCount", [addr, "latest"]);
    res.json({ address: addr, transactionCount: parseInt(result, 16) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
