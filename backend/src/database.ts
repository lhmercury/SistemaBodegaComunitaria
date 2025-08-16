// backend/src/database.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde el archivo .env

// URI de conexión a MongoDB. Usa la variable de entorno o una por defecto.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario-bodega';

// Función asíncrona para conectar a la base de datos
export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('📦 MongoDB conectado exitosamente.');
    } catch (err) {
        console.error('❌ Error al conectar a MongoDB:', err);
        process.exit(1); // Sale del proceso si la conexión falla
    }
};