import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rpcCall, weiToEth } from "../../lib/rpc.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const hash = req.query.hash as string;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    return res.status(400).json({ error: "Invalid transaction hash format" });
  }
  try {
    const tx = await rpcCall("eth_getTransactionByHash", [hash]);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    const receipt = await rpcCall("eth_getTransactionReceipt", [hash]);
    const block = tx.blockNumber ? await rpcCall("eth_getBlockByNumber", [tx.blockNumber, false]) : null;

    res.json({
      transaction: {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: weiToEth(tx.value || "0x0"),
        blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16) : null,
        gas: parseInt(tx.gas, 16),
        gasPrice: tx.gasPrice ? (parseInt(tx.gasPrice, 16) / 1e9).toFixed(4) : null,
        nonce: parseInt(tx.nonce, 16),
        status: receipt ? (receipt.status === "0x1" ? "success" : "failed") : "pending",
        gasUsed: receipt ? parseInt(receipt.gasUsed, 16) : null,
        timestamp: block ? parseInt(block.timestamp, 16) : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
