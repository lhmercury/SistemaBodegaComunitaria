// backend/src/routes/inventory.routes.ts
import { Router } from 'express';
import {
    getInventory,
    addProduct,
    addLot,
    getExpiringProducts,
    getProductDetails,
    updateLotQuantity,
    deleteLot
} from '../controllers/inventory.controller';

const router = Router();

// Rutas para productos
router.post('/products', addProduct);             // Añadir un nuevo producto
router.get('/products/:productId', getProductDetails); // Obtener detalles de un producto y sus lotes

// Rutas para lotes
router.post('/products/:productId/lots', addLot);   // Añadir un nuevo lote a un producto
router.put('/lots/:lotId', updateLotQuantity);      // Actualizar la cantidad de un lote
router.delete('/lots/:lotId', deleteLot);           // Eliminar un lote

// Rutas para el inventario y alertas
router.get('/inventory', getInventory);           // Obtener el inventario completo
router.get('/alerts/expiring', getExpiringProducts); // Obtener productos próximos a caducar

export default router;