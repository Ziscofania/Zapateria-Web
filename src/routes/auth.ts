import express from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import {
  findUserByEmail,
  saveOrUpdateUser,
  readUsers,
  User,
} from "../utils/datastore";
import { signAccessToken, signTempToken, verifyToken } from "../utils/jwt";

const router = express.Router();

/**
 * Register (simple) - opcional. Puedes prescindir y crear usuarios manualmente.
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing" });
  if (findUserByEmail(email)) return res.status(409).json({ error: "User exists" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = { id: uuidv4(), email, passwordHash, twoFactorEnabled: false };
  saveOrUpdateUser(user);
  res.json({ ok: true });
});

/**
 * Login: si password ok -> devuelve tempToken y info sobre si tiene 2FA configurado.
 * Si usuario no tiene 2FA configurado, puedes devolver otpauth_url para setup.
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // generar temp token corto
  const tempToken = signTempToken({ sub: user.id, email: user.email }, "5m");

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    // si no está configurado, generar secret para registro TOTP y devolver otpauth_url
    const secret = speakeasy.generateSecret({ name: `MyApp (${user.email})` });
    user.twoFactorSecret = secret.base32;
    // no habilitamos todavía until verification
    saveOrUpdateUser(user);
    // generar dataURL QR
    const otpAuthUrl = secret.otpauth_url!;
    const qrDataUrl = await qrcode.toDataURL(otpAuthUrl);
    return res.json({
      needs2FASetup: true,
      tempToken,
      otpAuthUrl,
      qrDataUrl,
    });
  }

  // Si ya tiene 2FA, avisamos que se requiere el código
  res.json({ needs2FAVerify: true, tempToken });
});

/**
 * Verify 2FA: recibe { token2fa, tempToken } -> si correcto devuelve accessToken
 */
router.post("/2fa-verify", (req, res) => {
  const { token2fa, tempToken } = req.body;
  if (!token2fa || !tempToken) return res.status(400).json({ error: "Missing" });

  try {
    const payload = verifyToken(tempToken);
    if (payload.purpose !== "2fa") return res.status(400).json({ error: "Invalid temp token" });
    const userId = payload.sub;
    const users = readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user || !user.twoFactorSecret) return res.status(400).json({ error: "User not found or 2FA not configured" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: String(token2fa),
      window: 1, // permitir +-1 intervalo
    });

    if (!verified) return res.status(401).json({ error: "Invalid 2FA code" });

    // Si la verificación de setup (si twoFactorEnabled false) -> habilitar
    if (!user.twoFactorEnabled) {
      user.twoFactorEnabled = true;
      saveOrUpdateUser(user);
    }

    // emitir access token final
    const accessToken = signAccessToken({ sub: user.id, email: user.email }, "2h");
    res.json({ accessToken });
  } catch (err) {
    return res.status(400).json({ error: "Invalid temp token" });
  }
});

export default router;