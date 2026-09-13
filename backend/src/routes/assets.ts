import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const assetsRouter = Router();
assetsRouter.use(requireAuth);

const assetTypes = ["accion", "cedear", "cripto", "fci", "bono", "plazo_fijo", "otro"] as const;

const assetSchema = z.object({
  type: z.enum(assetTypes),
  ticker: z.string().min(1).max(20).transform((s) => s.toUpperCase()),
  name: z.string().max(120).optional().nullable(),
  currencyBought: z.enum(["ARS", "USD"]),
  portfolioId: z.string().min(1),
});

assetsRouter.get("/", async (req, res, next) => {
  try {
    const portfolioId = (req.query.portfolioId as string | undefined) ?? (await defaultPortfolioId(req.userId!));
    const assets = await prisma.asset.findMany({
      where: { userId: req.userId, portfolioId },
      orderBy: { createdAt: "asc" },
    });
    res.json(assets);
  } catch (err) {
    next(err);
  }
});

async function defaultPortfolioId(userId: string) {
  const portfolio =
    (await prisma.portfolio.findFirst({ where: { userId, isDefault: true } })) ??
    (await prisma.portfolio.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } }));
  if (!portfolio) {
    throw new Error("Cartera no encontrada");
  }
  return portfolio.id;
}

assetsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = assetSchema.parse(req.body);
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: parsed.portfolioId, userId: req.userId },
    });
    if (!portfolio) {
      return res.status(404).json({ error: "Cartera no encontrada" });
    }
    const asset = await prisma.asset.create({
      data: { ...parsed, userId: req.userId! },
    });
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
});

assetsRouter.patch("/:id", async (req, res, next) => {
  try {
    const parsed = assetSchema.partial().parse(req.body);
    if (parsed.portfolioId) {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id: parsed.portfolioId, userId: req.userId },
      });
      if (!portfolio) {
        return res.status(404).json({ error: "Cartera no encontrada" });
      }
    }
    const asset = await prisma.asset.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: parsed,
    });
    if (asset.count === 0) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }
    const updated = await prisma.asset.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

assetsRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await prisma.asset.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
