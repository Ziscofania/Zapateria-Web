import express from 'express';
import cartRoutes from './routes/cart';  // Asegúrate de que la ruta esté correcta

const app = express();

// Middleware para manejar JSON
app.use(express.json());  // Esto permite que Express maneje los datos en formato JSON

// Usar las rutas de cart.ts
app.use('/api/cart', cartRoutes);  // Esto registrará la ruta /api/cart

// Ruta raíz (opcional)
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API de la zapatería!');
});

// Inicia el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
