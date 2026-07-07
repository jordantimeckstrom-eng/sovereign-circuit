import { pgTable, serial, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const ledgerEvents = pgTable(
  "ledger_events",
  {
    id: serial("id").primaryKey(),
    eventId: text("event_id").notNull().unique(),
    kind: text("kind").notNull(),
    action: text("action").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    kindIdx: index("ledger_events_kind_idx").on(t.kind),
    createdIdx: index("ledger_events_created_idx").on(t.createdAt),
  }),
);

export type LedgerEventRow = typeof ledgerEvents.$inferSelect;
export type InsertLedgerEventRow = typeof ledgerEvents.$inferInsert;
