import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { registerChatRoutes } from "./replit_integrations/chat/index.js";
import { registerImageRoutes } from "./replit_integrations/image/index.js";
import { registerBasescanRoutes } from "./routes/basescan.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  registerChatRoutes(app);
  registerImageRoutes(app);
  registerBasescanRoutes(app);

  app.use('/spine-align-time', express.static(path.resolve(__dirname, '../JUSCR/main/SpineAlignTime')));

  if (isProduction) {
    const distPath = path.resolve(__dirname, "../client/dist");
    app.use(express.static(distPath, { maxAge: "1h" }));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: path.resolve(__dirname, "../client"),
      server: {
        middlewareMode: true,
        hmr: false,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

main().catch(console.error);
