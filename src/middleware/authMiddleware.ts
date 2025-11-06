import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_strong_secret";

export interface AuthenticatedRequest extends Request {
  user?: { sub: string; email: string };
}

/**
 * Middleware que protege rutas verificando el token JWT.
 * Si es válido, agrega la información del usuario a req.user.
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
    req.user = decoded;
    next(); // continúa con la siguiente función o ruta
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
