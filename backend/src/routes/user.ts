import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { FxReference } from "@prisma/client";

export const userRouter = Router();
userRouter.use(requireAuth);

const userSchema = z.object({
  fxReference: z.nativeEnum(FxReference),
});

userRouter.get("/me", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, fxReference: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

userRouter.patch("/me", async (req, res, next) => {
  try {
    const parsed = userSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: parsed,
      select: { id: true, email: true, name: true, fxReference: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
