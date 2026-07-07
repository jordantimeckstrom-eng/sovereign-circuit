import type { Express, Request, Response } from "express";
import { buildSnapshot, persistAndBroadcast } from "../realtime/gateway.js";

// Lightweight in-memory rate limiter for the write endpoint: max 30 requests
// per 10s per client IP. Sufficient for a single-instance dev/autoscale node;
// stateless serverless (Vercel) relies on payload validation + size limits.
const WINDOW_MS = 10_000;
const MAX_HITS = 30;
const hits = new Map<string, { start: number; count: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_HITS;
}

// Bound the map so it cannot grow unbounded from spoofed IPs.
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of hits) {
    if (now - rec.start > WINDOW_MS) hits.delete(ip);
  }
}, 30_000).unref();

export function registerLedgerRoutes(app: Express) {
  app.get("/api/ledger/snapshot", async (_req: Request, res: Response) => {
    try {
      const snapshot = await buildSnapshot();
      res.json(snapshot);
    } catch (err) {
      console.error("[ledger] snapshot error:", err);
      res.status(500).json({ error: "Failed to build ledger snapshot" });
    }
  });

  app.post("/api/ledger/event", async (req: Request, res: Response) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
    if (rateLimited(ip)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const action = req.body?.action;
    if (!action || typeof action.type !== "string") {
      return res.status(400).json({ error: "Body must include { action: { type, payload? } }" });
    }
    try {
      const eventId = await persistAndBroadcast(action, req.body?.eventId, null);
      if (!eventId) {
        return res.status(400).json({ error: `Unsupported or invalid action: ${action.type}` });
      }
      res.json({ ok: true, eventId });
    } catch (err) {
      console.error("[ledger] event error:", err);
      res.status(500).json({ error: "Failed to record ledger event" });
    }
  });
}
