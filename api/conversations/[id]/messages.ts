import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db.js";
import { messages } from "../../../shared/schema.js";
import { eq } from "drizzle-orm";
import { getAI } from "../../lib/ai.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const db = getDb();
  const conversationId = parseInt(req.query.id as string);
  const { content } = req.body;

  try {
    await db.insert(messages).values({ conversationId, role: "user", content });

    const allMessages = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
    const chatMessages = allMessages.map((m) => ({
      role: (m.role === "assistant" ? "model" : m.role) as "user" | "model",
      parts: [{ text: m.content }],
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ai = getAI();
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: chatMessages,
      config: { maxOutputTokens: 8192 },
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const text = chunk.text || "";
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messages).values({ conversationId, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error sending message:", error);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "Failed to send message" });
    }
  }
}
