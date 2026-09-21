import { Request, Response, NextFunction } from "express";

/**
 * Deve ser usado sempre depois de `authMiddleware` — depende de
 * `req.anon_name` já estar preenchido com o payload do JWT (que inclui
 * `role`, definido no momento do login).
 */
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.anon_name?.role !== "admin") {
    return res.status(403).json({
      error: "Acesso restrito a administradores.",
    });
  }
  next();
};
