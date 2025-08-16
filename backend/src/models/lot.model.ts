// backend/src/models/lot.model.ts
import { Schema, Document, model, Types } from 'mongoose';

// Interfaz para definir la estructura de un documento de Lote
export interface ILot extends Document {
    productId: Types.ObjectId; // Referencia al producto al que pertenece este lote
    quantity: number;          // Cantidad de unidades en este lote
    expirationDate: Date;      // Fecha de caducidad de este lote
    batchNumber?: string;      // Número de lote opcional (para trazabilidad)
}

// Esquema de Mongoose para el modelo de Lote
const lotSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product', // Referencia a la colección 'Product'
        required: true
    },
    quantity: { type: Number, required: true, min: 0 }, // La cantidad no puede ser negativa
    expirationDate: { type: Date, required: true },
    batchNumber: { type: String }
}, {
    timestamps: true // Añade automáticamente campos 'createdAt' y 'updatedAt'
});

export default model<ILot>('Lot', lotSchema);