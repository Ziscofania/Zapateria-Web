import express from "express";
import path from "path";
import cors from "cors";


// Importar rutas
import cartRoutes from "./routes/cart"; 
import productRoutes from "./routes/products"; 
import authRoutes from "./routes/auth"; // ruta de login/registro

// Importar middleware de autenticación
import { authMiddleware } from "./middleware/authMiddleware";

// Configuración inicial
const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, JS, etc.)
app.use(express.static(path.join(__dirname, "..", "public")));

// ===============================
// RUTAS PÚBLICAS (sin autenticación)
// ===============================
app.use("/api/auth", authRoutes); // login / register

// ===============================
// RUTAS PROTEGIDAS (requieren JWT)
// ===============================
app.use("/api/cart", authMiddleware, cartRoutes);
app.use("/api/products", authMiddleware, productRoutes);

// ===============================
// RUTA RAÍZ
// ===============================
app.get("/", (req, res) => {
  res.send("¡Bienvenido a la API de la zapatería!");
});

// ===============================
// INICIAR SERVIDOR
// ===============================
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
