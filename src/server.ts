import express from "express";
import path from "path";
import cors from "cors";

// Importar rutas
import cartRoutes from "./routes/cart"; 
import productRoutes from "./routes/products"; 
import authRoutes from "./routes/auth";

// Importar middleware de autenticación
import { authMiddleware } from "./middleware/authMiddleware";

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "..", "public")));

// ===============================
// RUTAS PÚBLICAS
// ===============================
app.use("/api/auth", authRoutes);

// ===============================
// RUTAS PROTEGIDAS
// ===============================
app.use("/api/cart", authMiddleware, cartRoutes);
app.use("/api/products", authMiddleware, productRoutes);

// ===============================
// RUTA RAÍZ -> LOGIN
// ===============================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});


// ===============================
// INICIAR SERVIDOR
// ===============================
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
