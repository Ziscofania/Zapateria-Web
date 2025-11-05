import express from 'express';

const router = express.Router();

// Simulamos el carrito de compras con productos
let cart = [
    { id: 1, name: 'Zapato A', price: 50, quantity: 2 },
    { id: 2, name: 'Zapato B', price: 80, quantity: 1 },
    { id: 3, name: 'Zapato C', price: 60, quantity: 3 }
];

// Ruta para calcular el total del carrito
router.get('/total', (req, res) => {
    const total = cart.reduce((acc, product) => acc + (product.price * product.quantity), 0);
    res.json({ total: total });
});

export default router;

