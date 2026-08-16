import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

const transactionSchema = z.object({
  type: z.enum(["compra", "venta"]),
  quantity: z.number().positive(),
  price: z.number().positive(),
  currency: z.enum(["ARS", "USD"]),
  date: z.string().datetime().or(z.string().date()),
});

transactionsRouter.get("/assets/:assetId/transactions", async (req, res, next) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { id: req.params.assetId, userId: req.userId },
    });
    if (!asset) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { assetId: req.params.assetId },
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

transactionsRouter.post("/assets/:assetId/transactions", async (req, res, next) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { id: req.params.assetId, userId: req.userId },
    });
    if (!asset) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }

    const parsed = transactionSchema.parse(req.body);
    const transaction = await prisma.transaction.create({
      data: {
        assetId: req.params.assetId,
        ...parsed,
        date: new Date(parsed.date),
      },
    });
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

transactionsRouter.delete("/transactions/:id", async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        asset: { userId: req.userId },
      },
    });
    if (!tx) {
      return res.status(404).json({ error: "Transacción no encontrada" });
    }

    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
