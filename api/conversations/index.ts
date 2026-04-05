import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../lib/db.js";
import { conversations } from "../../shared/schema.js";
import { desc } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDb();

  if (req.method === "GET") {
    try {
      const all = await db.select().from(conversations).orderBy(desc(conversations.createdAt));
      return res.json(all);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return res.status(500).json({ error: "Failed to fetch conversations" });
    }
  }

  if (req.method === "POST") {
    try {
      const { title } = req.body;
      const [conversation] = await db.insert(conversations).values({ title: title || "New Chat" }).returning();
      return res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      return res.status(500).json({ error: "Failed to create conversation" });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
