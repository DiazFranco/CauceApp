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
});

assetsRouter.get("/", async (req, res, next) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "asc" },
    });
    res.json(assets);
  } catch (err) {
    next(err);
  }
});

assetsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = assetSchema.parse(req.body);
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
