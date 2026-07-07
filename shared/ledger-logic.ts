// Pure, dependency-free ledger logic shared by the Express gateway and the
// Vercel serverless handlers. No database or transport imports here.

export const CEREMONY_LABEL: Record<string, string> = {
  INCREMENT_DAWN: "Dawn ceremony completed",
  INCREMENT_DUSK: "Dusk ceremony completed",
  INCREMENT_CHAIN: "Alignment committed (+1)",
};

export interface SyncAction {
  type: string;
  payload?: unknown;
}

const CHANNELS = new Set(["UI", "Email", "External", "Scheduler", "SignalR"]);
const BID_STATUS = new Set(["Leading", "Outbid", "Sealed"]);
const SARAI = new Set(["Pending", "Heard", "Witnessed"]);

function clampStr(v: unknown, max: number): string {
  return String(v ?? "").slice(0, max);
}

function safeIso(v: unknown): string {
  const s = String(v ?? "");
  const t = Date.parse(s);
  return Number.isNaN(t) ? new Date().toISOString() : new Date(t).toISOString();
}

/**
 * Validate + sanitize a syncable action into a persistable { kind, payload }.
 * Returns null for unsupported or invalid actions (e.g. empty reflection).
 * Clamps string lengths and numeric ranges to prevent state poisoning.
 */
export function classify(action: SyncAction): { kind: string; payload: Record<string, unknown> } | null {
  switch (action.type) {
    case "INGEST_BID": {
      const p = (action.payload ?? {}) as Record<string, unknown>;
      if (typeof p !== "object") return null;
      let amount = Number(p.amount);
      if (!Number.isFinite(amount)) amount = 0;
      amount = Math.max(0, Math.min(amount, 1_000_000_000));
      return {
        kind: "bid",
        payload: {
          id: clampStr(p.id, 100) || `bid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: clampStr(p.name, 120) || "Anonymous",
          amount,
          channel: CHANNELS.has(String(p.channel)) ? String(p.channel) : "External",
          ...(p.ghostNote ? { ghostNote: clampStr(p.ghostNote, 200) } : {}),
          status: BID_STATUS.has(String(p.status)) ? String(p.status) : "Leading",
          saraiWhisper: SARAI.has(String(p.saraiWhisper)) ? String(p.saraiWhisper) : "Pending",
          timestamp: safeIso(p.timestamp),
        },
      };
    }
    case "DIGEST_GHOST": {
      const text = clampStr(action.payload, 500).trim();
      if (!text) return null;
      return { kind: "reflection", payload: { text } };
    }
    case "INCREMENT_DAWN":
    case "INCREMENT_DUSK":
    case "INCREMENT_CHAIN":
      return { kind: "ceremony", payload: { label: CEREMONY_LABEL[action.type] } };
    default:
      return null;
  }
}
