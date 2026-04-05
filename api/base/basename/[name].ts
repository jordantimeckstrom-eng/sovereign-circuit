import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rpcCall } from "../../lib/rpc.js";
import { computeNamehashKeccak } from "../../lib/namehash.js";
import { SOVEREIGN_IDENTITY } from "../../lib/sovereign.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const name = req.query.name as string;
  if (!name || name.length > 64 || !/^[a-zA-Z0-9._-]+$/.test(name)) {
    return res.status(400).json({ error: "Invalid basename format" });
  }

  const fullName = name.endsWith(".base.eth") ? name : `${name}.base.eth`;

  if (fullName === SOVEREIGN_IDENTITY.name) {
    return res.json({
      name: SOVEREIGN_IDENTITY.name,
      address: SOVEREIGN_IDENTITY.address,
      mintTx: SOVEREIGN_IDENTITY.mintTx,
      mintDate: SOVEREIGN_IDENTITY.mintDate,
      status: SOVEREIGN_IDENTITY.status,
    });
  }

  try {
    const namehash = computeNamehashKeccak(fullName);
    const resolverAddr = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";
    const callData = "0x3b3b57de" + namehash.slice(2);

    const result = await rpcCall("eth_call", [{ to: resolverAddr, data: callData }, "latest"]);

    if (!result || result === "0x" || result === "0x" + "0".repeat(64)) {
      return res.status(404).json({ error: "Basename not found or not resolved" });
    }

    res.json({ name: fullName, address: "0x" + result.slice(26), mintTx: null, mintDate: null, status: "Active" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
