// backend/src/models/product.model.ts
import { Schema, Document, model } from 'mongoose';

// Interfaz para definir la estructura de un documento de Producto
export interface IProduct extends Document {
    name: string;        // Nombre del producto (ej: "Leche Entera")
    category: string;    // Categoría a la que pertenece el producto (ej: "Lácteos", "Granos")
    description?: string; // Descripción opcional del producto
    unit?: string;       // Unidad de medida (ej: "litros", "kg", "unidades")
}

// Esquema de Mongoose para el modelo de Producto
const productSchema = new Schema({
    name: { type: String, required: true, unique: true }, // El nombre debe ser único
    category: { type: String, required: true },
    description: { type: String },
    unit: { type: String }
}, {
    timestamps: true // Añade automáticamente campos 'createdAt' y 'updatedAt'
});

export default model<IProduct>('Product', productSchema);