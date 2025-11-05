import { Router } from "express";
import type { Product } from "../types/index.d.js";

const router = Router();

/**
 * Catálogo ampliado con más productos y variedad de estilos
 */
const products: Product[] = [
  { id: 1, name: "Runner Azul", price: 199999, image: "/img/shoe_1.png", description: "Zapatilla ligera para correr, malla transpirable.", stock: 12 },
  { id: 2, name: "Classic Rojo", price: 149999, image: "/img/shoe_2.png", description: "Clásico urbano para uso diario.", stock: 24 },
  { id: 3, name: "Eco Verde", price: 179999, image: "/img/shoe_3.png", description: "Materiales reciclados, cómodo y resistente.", stock: 8 },
  { id: 4, name: "Urban Naranja", price: 159999, image: "/img/shoe_4.png", description: "Estilo urbano con suela de alta tracción.", stock: 16 },
  { id: 5, name: "Sport Morado", price: 189999, image: "/img/shoe_5.png", description: "Para entrenamientos de alto rendimiento.", stock: 10 },
  { id: 6, name: "Trail Gris", price: 209999, image: "/img/shoe_6.png", description: "Ideal para montaña y terrenos irregulares.", stock: 7 },

  // --- Ampliación del catálogo ---
  { id: 7, name: "Street Negro", price: 169999, image: "/img/shoe_7.png", description: "Diseño moderno para uso diario, gran durabilidad.", stock: 18 },
  { id: 8, name: "Flex Blanco", price: 159999, image: "/img/shoe_8.png", description: "Suela flexible y plantilla ergonómica.", stock: 20 },
  { id: 9, name: "Aero Azul Oscuro", price: 219999, image: "/img/shoe_9.png", description: "Zapatilla de alto rendimiento para velocidad.", stock: 9 },
  { id: 10, name: "Minimal Beige", price: 139999, image: "/img/shoe_10.png", description: "Estilo minimalista, ligera y elegante.", stock: 14 },
  { id: 11, name: "Comet Negro", price: 249999, image: "/img/shoe_11.png", description: "Inspirada en running profesional, máxima amortiguación.", stock: 5 },
  { id: 12, name: "Retro Blanco y Azul", price: 179999, image: "/img/shoe_12.png", description: "Estilo vintage con tecnología moderna.", stock: 13 },
];

/**
 * GET /catalogs
 * Retorna el listado completo de productos.
 */
router.get("/", (_req, res) => {
  res.json(products);
});

/**
 * GET /catalogs/:id
 * Retorna un producto específico por ID.
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
});

export default router;
