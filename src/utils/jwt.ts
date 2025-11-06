import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "super_secret_key";

// Generar un token JWT de sesión normal
export function signAccessToken(
  payload: object,
  expiresIn: string | number = "1h"
): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, JWT_SECRET, options);
}

// Generar un token temporal para autenticación en dos pasos (2FA)
export function signTempToken(
  payload: object,
  expiresIn: string | number = "5m"
): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  // Agregamos el campo "purpose" para identificar que es un token temporal
  return jwt.sign({ ...payload, purpose: "2fa" }, JWT_SECRET, options);
}

// Verificar y decodificar un token JWT
export function verifyToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}
