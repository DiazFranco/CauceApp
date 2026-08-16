import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getCryptoPriceUsd, CRYPTO_COIN_IDS } from "../lib/coingecko.js";

export const pricesRouter = Router();
pricesRouter.use(requireAuth);

const priceSchema = z.object({
  price: z.number().positive(),
  currency: z.enum(["ARS", "USD"]),
});

pricesRouter.put("/assets/:assetId/price", async (req, res, next) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { id: req.params.assetId, userId: req.userId },
    });
    if (!asset) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }

    const parsed = priceSchema.parse(req.body);
    const snapshot = await prisma.priceSnapshot.create({
      data: {
        assetId: req.params.assetId,
        price: parsed.price,
        currency: parsed.currency,
      },
    });
    res.status(201).json(snapshot);
  } catch (err) {
    next(err);
  }
});

pricesRouter.post("/assets/:assetId/price/fetch", async (req, res, next) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: { id: req.params.assetId, userId: req.userId },
    });
    if (!asset) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }

    if (asset.type === "cripto") {
      const coinId = CRYPTO_COIN_IDS[asset.ticker.toUpperCase()];
      if (!coinId) {
        return res.status(400).json({ error: "Ticker cripto no reconocido" });
      }
      const priceUsd = await getCryptoPriceUsd(coinId);
      const snapshot = await prisma.priceSnapshot.create({
        data: { assetId: asset.id, price: priceUsd, currency: "USD" },
      });
      return res.status(201).json(snapshot);
    }

    res.status(400).json({
      error: "La actualización automática de precios solo está disponible para cripto en el MVP",
    });
  } catch (err) {
    next(err);
  }
});
