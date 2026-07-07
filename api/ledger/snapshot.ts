import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSnapshot } from "../lib/ledger.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const snapshot = await buildSnapshot();
    res.status(200).json(snapshot);
  } catch (err) {
    console.error("[ledger] snapshot error:", err);
    res.status(500).json({ error: "Failed to build ledger snapshot" });
  }
}
