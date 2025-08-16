// backend/src/controllers/inventory.controller.ts
import { Request, Response } from 'express';
import Product, { IProduct } from '../models/product.model';
import Lot, { ILot } from '../models/lot.model';
import mongoose from 'mongoose';

// --- Funciones de Utilidad (Podrían ir en /backend/src/utils/helpers.ts) ---
// Función para calcular la fecha de alerta (por ejemplo, 15 días antes de la caducidad)
const getAlertDate = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

// --- Controladores de la API ---

// @desc    Obtener el inventario completo, agrupado por producto con sus lotes
// @route   GET /api/inventory
// @access  Public
export const getInventory = async (req: Request, res: Response) => {
    try {
        // Agregación para obtener el inventario de forma segmentada y totalizada
        const inventory = await Product.aggregate([
            {
                $lookup: {
                    from: 'lots',          // Colección 'lots'
                    localField: '_id',     // Campo en la colección 'products'
                    foreignField: 'productId', // Campo en la colección 'lots'
                    as: 'lots'             // Nombre del array para los lotes relacionados
                }
            },
            {
                $unwind: { path: '$lots', preserveNullAndEmptyArrays: true } // Desglosa los lotes, incluyendo productos sin lotes
            },
            {
                $sort: { 'lots.expirationDate': 1 } // Ordena los lotes por fecha de caducidad (FIFO)
            },
            {
                $group: {
                    _id: '$_id',           // Agrupa por el ID del producto
                    name: { $first: '$name' }, // Toma el primer nombre del producto
                    category: { $first: '$category' }, // Toma la primera categoría
                    description: { $first: '$description' },
                    unit: { $first: '$unit' },
                    totalQuantity: { $sum: '$lots.quantity' }, // Suma la cantidad total de todos los lotes
                    lots: {
                        $push: {
                            _id: '$lots._id',
                            quantity: '$lots.quantity',
                            expirationDate: '$lots.expirationDate',
                            batchNumber: '$lots.batchNumber',
                            createdAt: '$lots.createdAt'
                        }
                    }
                }
            },
            {
                $project: { // Proyecta los campos deseados para la salida final
                    _id: 1,
                    name: 1,
                    category: 1,
                    description: 1,
                    unit: 1,
                    totalQuantity: 1,
                    // Filtra los lotes nulos si un producto no tiene lotes
                    lots: {
                        $filter: {
                            input: '$lots',
                            as: 'lot',
                            cond: { $ne: ['$$lot._id', null] } // Remueve lotes con _id nulo (productos sin lotes)
                        }
                    }
                }
            },
            {
                $sort: { name: 1 } // Ordena los productos por nombre
            }
        ]);

        res.json(inventory);
    } catch (error) {
        console.error('Error al obtener el inventario:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el inventario.' });
    }
};

// @desc    Añadir un nuevo producto al inventario
// @route   POST /api/products
// @access  Public
export const addProduct = async (req: Request, res: Response) => {
    try {
        const { name, category, description, unit } = req.body;
        const newProduct: IProduct = new Product({ name, category, description, unit });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error: any) {
        if (error.code === 11000) { // Código de error de duplicado en MongoDB
            return res.status(400).json({ message: 'Ya existe un producto con este nombre.' });
        }
        console.error('Error al añadir producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir producto.' });
    }
};

// @desc    Añadir un nuevo lote a un producto existente
// @route   POST /api/products/:productId/lots
// @access  Public
export const addLot = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { quantity, expirationDate, batchNumber } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        const newLot: ILot = new Lot({
            productId: new mongoose.Types.ObjectId(productId),
            quantity,
            expirationDate: new Date(expirationDate), // Asegúrate de que es una fecha válida
            batchNumber
        });
        await newLot.save();
        res.status(201).json(newLot);
    } catch (error) {
        console.error('Error al añadir lote:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir lote.' });
    }
};

// @desc    Obtener productos próximos a caducar (lógica de alerta temprana FIFO)
// @route   GET /api/alerts/expiring
// @access  Public
export const getExpiringProducts = async (req: Request, res: Response) => {
    try {
        const alertDays = parseInt(req.query.days as string) || 30; // Días de anticipación (por defecto 30 días)
        const today = new Date();
        const alertDate = getAlertDate(alertDays); // Fecha límite para la alerta

        // Buscar lotes cuya fecha de caducidad esté entre hoy y la fecha de alerta
        const expiringLots = await Lot.find({
            expirationDate: { $lte: alertDate, $gte: today }
        })
            .sort({ expirationDate: 1 }) // Muy importante para FIFO: los más próximos a vencer primero
            .populate('productId', 'name category unit'); // Obtener nombre y categoría del producto asociado

        res.json(expiringLots);
    } catch (error) {
        console.error('Error al obtener productos próximos a caducar:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener alertas.' });
    }
};

// @desc    Obtener detalles de un producto específico, incluyendo todos sus lotes
// @route   GET /api/products/:productId
// @access  Public
export const getProductDetails = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        // Obtener todos los lotes asociados a este producto, ordenados por fecha de caducidad (FIFO)
        const lots = await Lot.find({ productId }).sort({ expirationDate: 1 });

        res.json({ product, lots });
    } catch (error) {
        console.error('Error al obtener detalles del producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener detalles del producto.' });
    }
};

// @desc    Actualizar la cantidad de un lote (ej. al consumir producto)
// @route   PUT /api/lots/:lotId
// @access  Public
export const updateLotQuantity = async (req: Request, res: Response) => {
    try {
        const { lotId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(lotId)) {
            return res.status(400).json({ message: 'ID de lote inválido.' });
        }

        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({ message: 'La cantidad debe ser un número positivo.' });
        }

        const lot = await Lot.findByIdAndUpdate(
            lotId,
            { quantity: quantity },
            { new: true, runValidators: true } // Retorna el documento actualizado y ejecuta validadores del esquema
        );

        if (!lot) {
            return res.status(404).json({ message: 'Lote no encontrado.' });
        }

        res.json(lot);
    } catch (error) {
        console.error('Error al actualizar la cantidad del lote:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el lote.' });
    }
};

// @desc    Eliminar un lote específico
// @route   DELETE /api/lots/:lotId
// @access  Public
export const deleteLot = async (req: Request, res: Response) => {
    try {
        const { lotId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lotId)) {
            return res.status(400).json({ message: 'ID de lote inválido.' });
        }

        const lot = await Lot.findByIdAndDelete(lotId);

        if (!lot) {
            return res.status(404).json({ message: 'Lote no encontrado.' });
        }

        res.status(200).json({ message: 'Lote eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar lote:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar lote.' });
    }
};