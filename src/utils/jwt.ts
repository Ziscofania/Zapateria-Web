import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_strong_secret";

export function signAccessToken(payload: object, expiresIn = "1h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function signTempToken(payload: object, expiresIn = "5m") {
  // token corto para paso 2FA
  return jwt.sign({ ...payload, purpose: "2fa" }, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}