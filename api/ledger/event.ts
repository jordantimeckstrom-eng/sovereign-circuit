import type { VercelRequest, VercelResponse } from "@vercel/node";
import { persistEvent } from "../lib/ledger.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const action = req.body?.action;
  if (!action || typeof action.type !== "string") {
    return res.status(400).json({ error: "Body must include { action: { type, payload? } }" });
  }
  try {
    const eventId = await persistEvent(action, req.body?.eventId);
    if (!eventId) {
      return res.status(400).json({ error: `Unsupported action type: ${action.type}` });
    }
    res.status(200).json({ ok: true, eventId });
  } catch (err) {
    console.error("[ledger] event error:", err);
    res.status(500).json({ error: "Failed to record ledger event" });
  }
}
