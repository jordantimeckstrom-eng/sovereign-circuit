import type { Server as HttpServer, IncomingMessage } from "http";
import type { Socket } from "net";
import { WebSocketServer, WebSocket } from "ws";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db.js";
import { ledgerEvents } from "../../shared/schema.js";
import { classify, type SyncAction } from "../../shared/ledger-logic.js";

export const LEDGER_WS_PATH = "/ws/ledger";

const clients = new Set<WebSocket>();

function makeEventId(): string {
  return `srv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Persist a ledger action to Postgres and broadcast it to every connected
 * client except `origin` (so the sender does not double-apply). Broadcasts
 * ONLY when a new row is actually inserted — a duplicate eventId is a no-op,
 * which preserves idempotency and prevents double-application on retries.
 * Returns the eventId, or null when the action is invalid/duplicate.
 */
export async function persistAndBroadcast(
  action: SyncAction,
  eventId: string | undefined,
  origin: WebSocket | null,
): Promise<string | null> {
  const classified = classify(action);
  if (!classified) return null;

  const id = eventId || makeEventId();
  let inserted: { id: number }[];
  try {
    inserted = await db
      .insert(ledgerEvents)
      .values({ eventId: id, kind: classified.kind, action: action.type, payload: classified.payload })
      .onConflictDoNothing({ target: ledgerEvents.eventId })
      .returning({ id: ledgerEvents.id });
  } catch (err) {
    console.error("[realtime] persist failed:", err);
    return null;
  }

  // Duplicate eventId — already persisted and already broadcast once. No-op.
  if (inserted.length === 0) return id;

  // Rebuild the action from the sanitized payload so clients apply clean data.
  const outAction =
    classified.kind === "bid"
      ? { type: action.type, payload: classified.payload }
      : classified.kind === "reflection"
        ? { type: action.type, payload: (classified.payload as { text: string }).text }
        : { type: action.type };

  const message = JSON.stringify({ t: "event", action: outAction, eventId: id });
  for (const client of clients) {
    if (client !== origin && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
  return id;
}

/** Build a full snapshot of shared ledger state from Postgres. */
export async function buildSnapshot() {
  // Display lists come from the most recent rows; counters are aggregated over
  // the FULL table so they never drift once history exceeds the fetch window.
  const [rows, dawnCount, duskCount, chainCount] = await Promise.all([
    db.select().from(ledgerEvents).orderBy(desc(ledgerEvents.createdAt)).limit(1000),
    countAction("INCREMENT_DAWN"),
    countAction("INCREMENT_DUSK"),
    countAction("INCREMENT_CHAIN"),
  ]);

  const bids: Record<string, unknown>[] = [];
  const events: { id: string; type: string; text: string; timestamp: string }[] = [];

  for (const row of rows) {
    const ts = row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt);
    if (row.kind === "bid") {
      bids.push({ ...(row.payload as Record<string, unknown>), timestamp: (row.payload as any)?.timestamp || ts });
    } else if (row.kind === "reflection") {
      events.push({ id: row.eventId, type: "reflection", text: String((row.payload as any)?.text ?? ""), timestamp: ts });
    } else if (row.kind === "ceremony") {
      events.push({ id: row.eventId, type: "ceremony", text: String((row.payload as any)?.label ?? "Ceremony"), timestamp: ts });
    }
  }

  return {
    bids: bids.slice(0, 200),
    events: events.slice(0, 500),
    dawnCount,
    duskCount,
    chainCount: Math.min(chainCount, 1132),
    lastSync: new Date().toISOString(),
  };
}

async function countAction(action: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ledgerEvents)
    .where(eq(ledgerEvents.action, action));
  return row?.count ?? 0;
}

/** Attach the ledger WebSocket gateway to an existing HTTP server. */
export function attachRealtime(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    let pathname = "";
    try {
      pathname = new URL(req.url || "", `http://${req.headers.host}`).pathname;
    } catch {
      pathname = req.url || "";
    }
    if (pathname === LEDGER_WS_PATH) {
      wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
    }
    // Any other upgrade path is left untouched (e.g. Vite HMR).
  });

  wss.on("connection", async (ws: WebSocket) => {
    clients.add(ws);

    // Lightweight per-connection rate limit: max 40 published messages / 10s.
    let windowStart = Date.now();
    let count = 0;

    ws.on("message", async (raw) => {
      const text = raw.toString();
      if (text.length > 16_384) return; // 16KB message cap

      const now = Date.now();
      if (now - windowStart > 10_000) {
        windowStart = now;
        count = 0;
      }
      if (++count > 40) return; // drop excess without disconnecting

      let msg: any;
      try {
        msg = JSON.parse(text);
      } catch {
        return;
      }
      if (msg?.t === "publish" && msg.action?.type) {
        await persistAndBroadcast(msg.action, msg.eventId, ws);
      }
    });

    ws.on("close", () => clients.delete(ws));
    ws.on("error", () => clients.delete(ws));

    try {
      const snapshot = await buildSnapshot();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ t: "history", ...snapshot }));
      }
    } catch (err) {
      console.error("[realtime] snapshot failed:", err);
    }
  });

  console.log(`[realtime] ledger gateway listening on ${LEDGER_WS_PATH}`);
}
