import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SOVEREIGN_IDENTITY } from "../lib/sovereign.js";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({
    name: SOVEREIGN_IDENTITY.name,
    address: SOVEREIGN_IDENTITY.address,
    mintTx: SOVEREIGN_IDENTITY.mintTx,
    mintDate: SOVEREIGN_IDENTITY.mintDate,
    status: SOVEREIGN_IDENTITY.status,
  });
}
