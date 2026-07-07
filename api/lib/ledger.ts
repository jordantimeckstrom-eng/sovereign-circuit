import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "./db.js";
import { ledgerEvents } from "../../shared/schema.js";
import { classify, type SyncAction } from "../../shared/ledger-logic.js";

function makeEventId(): string {
  return `srv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Persist a ledger action (Vercel serverless — no WebSocket broadcast).
 * Idempotent on eventId; returns null for invalid actions.
 */
export async function persistEvent(action: SyncAction, eventId?: string): Promise<string | null> {
  const classified = classify(action);
  if (!classified) return null;
  const id = eventId || makeEventId();
  const db = getDb();
  await db
    .insert(ledgerEvents)
    .values({ eventId: id, kind: classified.kind, action: action.type, payload: classified.payload })
    .onConflictDoNothing({ target: ledgerEvents.eventId });
  return id;
}

async function countAction(db: ReturnType<typeof getDb>, action: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ledgerEvents)
    .where(eq(ledgerEvents.action, action));
  return row?.count ?? 0;
}

/** Build a full snapshot of shared ledger state from Postgres. */
export async function buildSnapshot() {
  const db = getDb();
  // Counters aggregate over the full table so they never drift; display lists
  // use only the most recent rows.
  const [rows, dawnCount, duskCount, chainCount] = await Promise.all([
    db.select().from(ledgerEvents).orderBy(desc(ledgerEvents.createdAt)).limit(1000),
    countAction(db, "INCREMENT_DAWN"),
    countAction(db, "INCREMENT_DUSK"),
    countAction(db, "INCREMENT_CHAIN"),
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
