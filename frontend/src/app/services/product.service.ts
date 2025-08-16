// frontend/src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Lot, InventoryItem } from '../models/inventory.model';
import { environment } from 'src/environments/environment'; // Para la URL de la API

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    // La URL base de la API se define en los archivos de entorno
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Obtener todo el inventario agrupado
    getInventory(): Observable<InventoryItem[]> {
        return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory`);
    }

    // Obtener productos próximos a caducar
    getExpiringProducts(days: number = 30): Observable<Lot[]> {
        return this.http.get<Lot[]>(`${this.apiUrl}/alerts/expiring?days=${days}`);
    }

    // Añadir un nuevo producto
    addProduct(product: Product): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}/products`, product);
    }

    // Añadir un lote a un producto existente
    addLot(productId: string, lot: Partial<Lot>): Observable<Lot> {
        return this.http.post<Lot>(`${this.apiUrl}/products/${productId}/lots`, lot);
    }

    // Actualizar la cantidad de un lote (ej. al consumir)
    updateLotQuantity(lotId: string, quantity: number): Observable<Lot> {
        return this.http.put<Lot>(`${this.apiUrl}/lots/${lotId}`, { quantity });
    }

    // Eliminar un lote
    deleteLot(lotId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/lots/${lotId}`);
    }

    // Obtener detalles de un producto (incluye sus lotes)
    getProductDetails(productId: string): Observable<{ product: Product, lots: Lot[] }> {
        return this.http.get<{ product: Product, lots: Lot[] }>(`${this.apiUrl}/products/${productId}`);
    }
}