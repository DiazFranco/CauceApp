import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { computePortfolio, savePortfolioSnapshot } from "../services/valuation.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (req, res, next) => {
  try {
    const result = await computePortfolio(req.userId!);

    const history = await prisma.portfolioSnapshot.findMany({
      where: { userId: req.userId },
      orderBy: { date: "asc" },
    });

    void savePortfolioSnapshot(req.userId!, result).catch(() => {});

    res.json({
      totalArs: Math.round(result.totalArs),
      totalUsd: result.totalUsd,
      fxRate: result.fxRate,
      fxName: result.fxName,
      assets: result.positions,
      history: history.map((h) => ({
        id: h.id,
        totalArs: h.totalArs.toNumber(),
        totalUsd: h.totalUsd.toNumber(),
        date: h.date.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});
