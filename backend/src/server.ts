// backend/src/server.ts
import express from 'express';
import cors from 'cors';      // Importa el middleware CORS
import dotenv from 'dotenv';  // Importa dotenv para variables de entorno
import { connectDB } from './database'; // Importa la función de conexión a la DB
import inventoryRoutes from './routes/inventory.routes'; // Importa las rutas de inventario

dotenv.config(); // Carga las variables de entorno

const app = express();
const PORT = process.env.PORT || 3000; // Puerto del servidor (por defecto 3000)

// --- Middlewares ---
app.use(cors()); // Habilita CORS para permitir solicitudes desde el frontend (Angular)
app.use(express.json()); // Habilita el parsing de JSON para las solicitudes HTTP

// --- Conexión a la base de datos ---
connectDB();

// --- Rutas de la API ---
app.use('/api', inventoryRoutes); // Prefijo '/api' para todas las rutas de inventario

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Inventario para Bodegas Comunitarias funcionando!');
});

// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});