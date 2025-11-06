// __tests__/zapateria.test.ts
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import request from "supertest";
import express from "express";
import bcrypt from "bcrypt";

// Importar módulos del proyecto
import * as datastore from "../src/utils/datastore";
import * as jwtUtils from "../src/utils/jwt";
import authRouter from "../src/routes/auth";
import productsRouter from "../src/routes/products";
import cartRouter from "../src/routes/cart";
//import { authMiddleware } from "../src/middleware/authMiddleware";
//import { datastore } from "../src/utils/datastore";
import { authMiddleware } from "../src/middleware/authMiddleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");
const USERS_PATH = path.resolve(PROJECT_ROOT, "src", "data", "users.json");''


describe("Zapateria Web - suite de 10 pruebas unitarias", () => {
  // Guardamos el archivo users.json original y lo restauramos luego
  let originalUsersRaw: string;

  beforeAll(() => {
    originalUsersRaw = fs.readFileSync(USERS_PATH, "utf-8");
  });

  afterAll(() => {
    // Restaurar users.json original
    fs.writeFileSync(USERS_PATH, originalUsersRaw, "utf-8");
  });

  test("1) datastore.readUsers() devuelve un array (al menos el esquema es correcto)", () => {
    const users = datastore.readUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  test("2) datastore.saveOrUpdateUser() agrega un usuario y findUserByEmail lo encuentra", () => {
    // crear usuario temporal
    const email = `test_${Date.now()}@example.com`;
    const user = {
      id: "u-test-1",
      email,
      passwordHash: "$2b$10$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", // dummy
      twoFactorEnabled: false,
    } as any;

    // asegurarse que no exista
    const before = datastore.findUserByEmail(email);
    expect(before).toBeUndefined();

    // guardar
    datastore.saveOrUpdateUser(user);

    // ahora debe existir
    const found = datastore.findUserByEmail(email);
    expect(found).toBeDefined();
    expect(found!.email).toBe(email);
  });

  test("3) datastore.saveOrUpdateUser() actualiza un usuario existente", () => {
    const email = `test_update_${Date.now()}@example.com`;
    const user = {
      id: "u-test-2",
      email,
      passwordHash: "$2b$10$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      twoFactorEnabled: false,
    } as any;
    datastore.saveOrUpdateUser(user);

    // actualizar campo
    user.twoFactorEnabled = true;
    datastore.saveOrUpdateUser(user);

    const found = datastore.findUserByEmail(email);
    expect(found).toBeDefined();
    expect(found!.twoFactorEnabled).toBe(true);
  });

  test("4) jwt.signAccessToken y verifyToken funcionan y preservan sub/email", () => {
    const payload = { sub: "user-123", email: "u@example.com" };
    const token = jwtUtils.signAccessToken(payload, "1h");
    expect(typeof token).toBe("string");
    const decoded = jwtUtils.verifyToken<any>(token);
    expect(decoded).not.toBeNull();
    expect(decoded.sub).toBe("user-123");
    expect(decoded.email).toBe("u@example.com");
  });

  test("5) jwt.signTempToken agrega campo purpose: '2fa' al payload", () => {
    const token = jwtUtils.signTempToken({ sub: "u1", email: "a@b.c" }, "10m");
    const decoded = jwtUtils.verifyToken<any>(token);
    expect(decoded).not.toBeNull();
    expect(decoded.purpose).toBe("2fa");
  });

  test("6) POST /register (auth router) crea un usuario (200 OK json {ok:true})", async () => {
    const app = express();
    app.use(express.json());
    app.use("/auth", authRouter);

    const email = `register_${Date.now()}@example.com`;
    const res = await request(app).post("/auth/register").send({ email, password: "miPass123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);

    // user must be persisted
    const found = datastore.findUserByEmail(email);
    expect(found).toBeDefined();
    expect(found!.email).toBe(email);
  });

  test("7) POST /login devuelve otpAuthUrl + tempToken cuando 2FA no está configurada", async () => {
    const app = express();
    app.use(express.json());
    app.use("/auth", authRouter);

    // crear usuario por registro directo en datastore
    const email = `login2fa_${Date.now()}@example.com`;
    const plain = "passTesting123";
    const passwordHash = await bcrypt.hash(plain, 10);
    datastore.saveOrUpdateUser({ id: `id-${Date.now()}`, email, passwordHash, twoFactorEnabled: false });

    const res = await request(app).post("/auth/login").send({ email, password: plain });
    expect(res.status).toBe(200);
    // Si 2FA no configurada, la ruta devuelve tempToken y otpAuthUrl y qrDataUrl (según implementación)
    expect(res.body).toHaveProperty("tempToken");
    // puede devolver otpAuthUrl (setup) y qrDataUrl
    expect(res.body).toHaveProperty("otpAuthUrl");
    expect(res.body).toHaveProperty("qrDataUrl");
  });

  test("8) POST /login con contraseña incorrecta devuelve 401", async () => {
    const app = express();
    app.use(express.json());
    app.use("/auth", authRouter);

    // usuario existente
    const email = `login_bad_${Date.now()}@example.com`;
    const plain = "correctPass";
    const passwordHash = await bcrypt.hash(plain, 10);
    datastore.saveOrUpdateUser({ id: `id-${Date.now()}`, email, passwordHash, twoFactorEnabled: false });

    const res = await request(app).post("/auth/login").send({ email, password: "wrongPass" });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("9) GET /:id (products router) devuelve producto existente y 404 para no existente", async () => {
    const app = express();
    app.use("/products", productsRouter);

    // probar id que exista en router (el código de products tiene id=1)
    const resOk = await request(app).get("/products/1");
    expect([200, 201, 204].includes(resOk.status)).toBeTruthy(); // algunos routers devuelven 200
    if (resOk.status === 200) {
      expect(resOk.body).toHaveProperty("id", 1);
      expect(resOk.body).toHaveProperty("name");
    }

    const resNot = await request(app).get("/products/99999");
    expect(resNot.status).toBe(404);
  });

  test("10) GET /total (cart router) calcula correctamente el total", async () => {
    const app = express();
    app.use("/cart", cartRouter);

    const res = await request(app).get("/cart/total");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("total");
    // según archivo cart.ts el arreglo inicial suma: (50*2)+(80*1)+(60*3) = 100 + 80 + 180 = 360
    expect(typeof res.body.total).toBe("number");
    expect(res.body.total).toBe(360);
  });
});
