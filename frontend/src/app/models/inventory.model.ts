// frontend/src/app/models/inventory.model.ts

export interface Product {
    _id?: string; // El ID es opcional al crear un nuevo producto
    name: string;
    category: string;
    description?: string;
    unit?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Lot {
    _id?: string; // El ID es opcional al crear un nuevo lote
    productId: string; // Referencia al ID del producto
    quantity: number;
    expirationDate: Date;
    batchNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interfaz para la vista agrupada del inventario
export interface InventoryItem {
    _id: string; // ID del producto
    name: string;
    category: string;
    description?: string;
    unit?: string;
    totalQuantity: number; // Suma total de cantidad de todos los lotes de este producto
    lots: Lot[]; // Array de lotes asociados a este producto
}