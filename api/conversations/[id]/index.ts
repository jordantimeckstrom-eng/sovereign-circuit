import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db.js";
import { conversations, messages } from "../../../shared/schema.js";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDb();
  const id = parseInt(req.query.id as string);

  if (req.method === "GET") {
    try {
      const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conversation) return res.status(404).json({ error: "Conversation not found" });
      const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
      return res.json({ ...conversation, messages: msgs });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return res.status(500).json({ error: "Failed to fetch conversation" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.delete(messages).where(eq(messages.conversationId, id));
      await db.delete(conversations).where(eq(conversations.id, id));
      return res.status(204).send(undefined);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return res.status(500).json({ error: "Failed to delete conversation" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
