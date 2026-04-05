import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rpcCall } from "../../lib/rpc.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const block = await rpcCall("eth_getBlockByNumber", ["latest", false]);
    res.json({
      blockNumber: parseInt(block.number, 16),
      timestamp: parseInt(block.timestamp, 16),
      gasUsed: parseInt(block.gasUsed, 16),
      gasLimit: parseInt(block.gasLimit, 16),
      txCount: block.transactions.length,
      hash: block.hash,
      parentHash: block.parentHash,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
