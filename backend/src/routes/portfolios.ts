import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const portfoliosRouter = Router();
portfoliosRouter.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1).max(60),
});

const updateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  isDefault: z.boolean().optional(),
});

portfoliosRouter.get("/", async (req, res, next) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: req.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      include: { _count: { select: { assets: true } } },
    });
    res.json(portfolios);
  } catch (err) {
    next(err);
  }
});

portfoliosRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createSchema.parse(req.body);
    const count = await prisma.portfolio.count({ where: { userId: req.userId } });
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: req.userId!,
        name: parsed.name,
        isDefault: count === 0,
      },
    });
    res.status(201).json(portfolio);
  } catch (err) {
    next(err);
  }
});

portfoliosRouter.patch("/:id", async (req, res, next) => {
  try {
    const parsed = updateSchema.parse(req.body);
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!portfolio) {
      return res.status(404).json({ error: "Cartera no encontrada" });
    }

    if (parsed.isDefault) {
      await prisma.portfolio.updateMany({
        where: { userId: req.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { ...parsed },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

portfoliosRouter.delete("/:id", async (req, res, next) => {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!portfolio) {
      return res.status(404).json({ error: "Cartera no encontrada" });
    }

    const count = await prisma.portfolio.count({ where: { userId: req.userId } });
    if (count <= 1) {
      return res.status(400).json({ error: "No se puede eliminar la única cartera" });
    }

    await prisma.portfolio.delete({ where: { id: portfolio.id } });

    if (portfolio.isDefault) {
      const nextDefault = await prisma.portfolio.findFirst({
        where: { userId: req.userId },
        orderBy: { createdAt: "asc" },
      });
      if (nextDefault) {
        await prisma.portfolio.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});