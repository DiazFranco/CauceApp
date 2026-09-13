import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { computePortfolio, savePortfolioSnapshot } from "../services/valuation.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (req, res, next) => {
  try {
    const portfolioId = req.query.portfolioId as string | undefined;
    const result = await computePortfolio(req.userId!, portfolioId);

    const history = await prisma.portfolioSnapshot.findMany({
      where: { portfolioId: result.portfolioId },
      orderBy: { date: "asc" },
    });

    const last = history[history.length - 1];
    if (!last || shouldSave(last, result.totalArs)) {
      void savePortfolioSnapshot(req.userId!, result.portfolioId, result).catch(() => {});
    }

    res.json({
      portfolioId: result.portfolioId,
      portfolioName: result.portfolioName,
      totalArs: Math.round(result.totalArs),
      totalUsd: result.totalUsd,
      fxRate: result.fxRate,
      fxName: result.fxName,
      assets: result.positions,
      history: [
        ...history.map((h) => ({
          id: h.id,
          totalArs: h.totalArs.toNumber(),
          totalUsd: h.totalUsd.toNumber(),
          date: h.date.toISOString(),
        })),
        {
          id: "actual",
          totalArs: Math.round(result.totalArs),
          totalUsd: result.totalUsd,
          date: new Date().toISOString(),
        },
      ],
    });
  } catch (err) {
    next(err);
  }
});

function shouldSave(last: { totalArs: { toNumber(): number }; date: Date }, newArs: number) {
  const hourInMs = 60 * 60 * 1000;
  const recent = Date.now() - last.date.getTime() < hourInMs;
  const previous = last.totalArs.toNumber();
  const diffPct = previous > 0 ? Math.abs(newArs - previous) / previous : 1;
  const ratio = previous > 0 ? newArs / previous : 1;
  const plausible = ratio <= 5 && ratio >= 0.2;
  return (!recent || diffPct > 0.005) && plausible;
}
