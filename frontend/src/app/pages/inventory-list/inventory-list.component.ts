// frontend/src/app/pages/inventory-list/inventory-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { InventoryItem, Lot } from '../../models/inventory.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent implements OnInit {
  inventory: InventoryItem[] = [];
  filteredInventory: InventoryItem[] = [];
  searchTerm: string = '';
  categoryFilter: string = '';
  availableCategories: string[] = []; // Para el filtro por categoría
  private searchSubject = new Subject<string>();

  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadInventory();
    this.searchSubject.pipe(
      debounceTime(300), // Espera 300ms después de la última pulsación de tecla
      distinctUntilChanged() // Solo emite si el valor actual es diferente al último
    ).subscribe(() => this.applyFilters());
  }

  loadInventory(): void {
    this.productService.getInventory().subscribe({
      next: (data) => {
        this.inventory = data;
        this.extractCategories(); // Extraer categorías únicas
        this.applyFilters(); // Aplicar filtros iniciales
      },
      error: (err) => {
        console.error('Error al cargar el inventario:', err);
        this.errorMessage = 'No se pudo cargar el inventario. Inténtelo de nuevo más tarde.';
      }
    });
  }

  extractCategories(): void {
    const categories = new Set<string>();
    this.inventory.forEach(item => categories.add(item.category));
    this.availableCategories = Array.from(categories).sort();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let tempInventory = [...this.inventory];

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempInventory = tempInventory.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.description?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filtrar por categoría
    if (this.categoryFilter) {
      tempInventory = tempInventory.filter(item => item.category === this.categoryFilter);
    }

    this.filteredInventory = tempInventory;
  }

  // --- Lógica para gestionar lotes ---
  // Reduce la cantidad de un lote (simula consumo)
  decreaseLotQuantity(lot: Lot): void {
    this.resetMessages();
    if (lot.quantity > 0) {
      const newQuantity = lot.quantity - 1;
      this.productService.updateLotQuantity(lot._id!, newQuantity).subscribe({
        next: (updatedLot) => {
          this.successMessage = `Cantidad del lote actualizada para ${lot.productId.name}. Nueva cantidad: ${updatedLot.quantity}`;
          this.loadInventory(); // Recargar para reflejar cambios en la UI
        },
        error: (err) => {
          console.error('Error al actualizar cantidad:', err);
          this.errorMessage = err.error?.message || 'Error al actualizar la cantidad del lote.';
        }
      });
    } else {
      this.errorMessage = 'La cantidad del lote ya es 0. No se puede disminuir más.';
    }
  }

  // Elimina un lote
  deleteLot(lotId: string, productName: string): void {
    this.resetMessages();
    if (confirm(`¿Está seguro de que desea eliminar el lote del producto '${productName}'? Esta acción es irreversible.`)) {
      this.productService.deleteLot(lotId).subscribe({
        next: () => {
          this.successMessage = `Lote del producto '${productName}' eliminado con éxito.`;
          this.loadInventory(); // Recargar para reflejar cambios en la UI
        },
        error: (err) => {
          console.error('Error al eliminar lote:', err);
          this.errorMessage = err.error?.message || 'Error al eliminar el lote.';
        }
      });
    }
  }

  resetMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}
```html
<!-- frontend/src/app/pages/inventory-list/inventory-list.component.html -->
<div class="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen rounded-lg shadow-md">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">📋 Listado de Inventario Detallado</h1>

    <div *ngIf="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded" role="alert">
        <p class="font-bold">¡Éxito!</p>
        <p>{{ successMessage }}</p>
    </div>
    <div *ngIf="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
        <p class="font-bold">¡Error!</p>
        <p>{{ errorMessage }}</p>
    </div>

    <!-- Controles de Filtro y Búsqueda -->
    <div class="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div class="flex-grow">
            <label for="search" class="sr-only">Buscar</label>
            <input type="text" id="search" placeholder="Buscar por nombre o descripción..."
                   [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()"
                   class="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="flex-shrink-0">
            <label for="categoryFilter" class="sr-only">Filtrar por Categoría</label>
            <select id="categoryFilter" [(ngModel)]="categoryFilter" (ngModelChange)="onCategoryChange()"
                    class="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Todas las Categorías</option>
                <option *ngFor="let category of availableCategories" [value]="category">{{ category }}</option>
            </select>
        </div>
    </div>

    <!-- Tabla del Inventario -->
    <div *ngIf="filteredInventory.length === 0 && !errorMessage" class="text-center text-lg text-gray-600 p-8 bg-white rounded-lg shadow-sm">
        No se encontraron productos en el inventario que coincidan con los filtros.
    </div>

    <div *ngIf="filteredInventory.length > 0" class="overflow-x-auto bg-white rounded-lg shadow-md">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad Total
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lotes (Caducidad | Cantidad | Lote)
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones por Lote
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <ng-container *ngFor="let item of filteredInventory">
                    <tr class="bg-blue-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                            {{ item.name }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {{ item.category }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold">
                            {{ item.totalQuantity }} {{ item.unit || 'unidades' }}
                        </td>
                        <td colspan="2"></td> <!-- Colspan para alinear bien las sub-filas -->
                    </tr>
                    <!-- Fila para cada lote -->
                    <tr *ngFor="let lot of item.lots" class="hover:bg-gray-50">
                        <td></td> <!-- Columna vacía para indentar visualmente -->
                        <td></td>
                        <td></td>
                        <td class="px-6 py-2 text-sm text-gray-600">
                            <span [class.text-red-600]="lot.expirationDate && (lot.expirationDate | date:'yyyyMMdd') < (today | date:'yyyyMMdd')">
                                {{ lot.expirationDate | date:'dd/MM/yyyy' }}
                            </span>
                            | Cant: {{ lot.quantity }}
                            <span *ngIf="lot.batchNumber">| Lote: {{ lot.batchNumber }}</span>
                        </td>
                        <td class="px-6 py-2 whitespace-nowrap text-sm font-medium flex gap-2">
                            <button (click)="decreaseLotQuantity(lot)"
                                    class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    title="Disminuir Cantidad (Consumir)"
                                    [disabled]="lot.quantity === 0">
                                <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <button (click)="deleteLot(lot._id!, item.name)"
                                    class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    title="Eliminar Lote">
                                <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </ng-container>
            </tbody>
        </table>
    </div>
</div>
```css
/* frontend/src/app/pages/inventory-list/inventory-list.component.css */
/* Estilos adicionales si son necesarios, además de Tailwind */
.container {
    max-width: 1400px; /* Un poco más ancho para la tabla */
}

/* Estilo para filas de productos principales */
tr.bg-blue-50 {
    background-color: #e0f2fe; /* Color más claro para las filas de productos */
}