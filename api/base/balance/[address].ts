import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rpcCall, weiToEth } from "../../lib/rpc.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const addr = req.query.address as string;
  if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
    return res.status(400).json({ error: "Invalid address format" });
  }
  try {
    const result = await rpcCall("eth_getBalance", [addr, "latest"]);
    const balanceWei = BigInt(result);
    res.json({ address: addr, balance: weiToEth(result), balanceWei: balanceWei.toString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
