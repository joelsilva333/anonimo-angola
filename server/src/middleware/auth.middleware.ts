import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";

declare global {
  namespace Express {
    interface Request {
      anon_name?: any;
    }
  }
}

interface JwtPayload {
  id: string;
  anon_name: string;
}

const userRepository = new UserRepository();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Token não fornecido" });

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!decoded.id) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Suspensões (automáticas por moderação, ou manuais) têm de aplicar-se
    // de imediato — não só quando o token expirar — por isso verificamos
    // sempre o estado actual da conta, não apenas a assinatura do JWT.
    const user = await userRepository.findById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(403).json({
        error:
          user?.banned_reason ||
          "Esta conta está suspensa e não pode realizar esta ação.",
        code: "ACCOUNT_SUSPENDED",
      });
    }

    req.anon_name = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};
