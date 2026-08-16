import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { prisma } from "../db.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no provisto" });
  }

  const token = header.slice("Bearer ".length);

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  const supabaseUser = data.user;

  await prisma.user.upsert({
    where: { id: supabaseUser.id },
    update: {
      email: supabaseUser.email ?? "",
      name: (supabaseUser.user_metadata?.full_name as string) ?? supabaseUser.email ?? null,
      avatarUrl: (supabaseUser.user_metadata?.avatar_url as string) ?? null,
    },
    create: {
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      name: (supabaseUser.user_metadata?.full_name as string) ?? supabaseUser.email ?? null,
      avatarUrl: (supabaseUser.user_metadata?.avatar_url as string) ?? null,
    },
  });

  req.userId = supabaseUser.id;
  next();
}
