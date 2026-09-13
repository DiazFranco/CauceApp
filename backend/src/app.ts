import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { env } from "./env.js";
import { assetsRouter } from "./routes/assets.js";
import { portfoliosRouter } from "./routes/portfolios.js";
import { transactionsRouter } from "./routes/transactions.js";
import { pricesRouter } from "./routes/prices.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { userRouter } from "./routes/user.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/assets", assetsRouter);
  app.use("/api/portfolios", portfoliosRouter);
  app.use("/api", transactionsRouter);
  app.use("/api", pricesRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api", userRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Datos inválidos", issues: err.issues });
    }
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  });

  return app;
}
