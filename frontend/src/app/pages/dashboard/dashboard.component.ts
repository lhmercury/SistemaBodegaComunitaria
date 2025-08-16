// frontend/src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { InventoryItem, Lot } from '../../models/inventory.model';
import { forkJoin } from 'rxjs'; // Para combinar observables

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  inventory: InventoryItem[] = [];
  expiringLots: Lot[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      inventory: this.productService.getInventory(),
      expiringLots: this.productService.getExpiringProducts(30) // Obtener alertas para los próximos 30 días
    }).subscribe({
      next: ({ inventory, expiringLots }) => {
        this.inventory = inventory;
        // Ordenar los lotes por fecha de caducidad para priorizar FIFO visualmente
        this.expiringLots = expiringLots.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los datos del dashboard:', err);
        this.error = 'No se pudieron cargar los datos del dashboard. Inténtelo de nuevo más tarde.';
        this.loading = false;
      }
    });
  }

  // Lógica para resaltar productos críticos (cerca de caducar)
  isCritical(expirationDate: Date): boolean {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = Math.abs(expiry.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Considerar crítico si caduca en 7 días o menos
  }
}
```html
<!-- frontend/src/app/pages/dashboard/dashboard.component.html -->
<div class="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen rounded-lg shadow-md">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">📊 Dashboard de Inventario Comunitario</h1>

    <div *ngIf="loading" class="text-center text-lg text-blue-600">Cargando datos del inventario...</div>
    <div *ngIf="error" class="text-center text-lg text-red-600">{{ error }}</div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Tarjeta de Resumen de Inventario -->
        <div class="bg-white p-6 rounded-lg shadow-md border border-blue-200">
            <h2 class="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7l-1.6 5M20 7l1.6 5M12 4v16m0-16h.01M12 4c-4.418 0-8 1.79-8 4v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M12 4h.01M12 4c-4.418 0-8 1.79-8 4v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7m-4 10h8m-8-4h8" />
                </svg>
                Resumen de Inventario
            </h2>
            <p class="text-gray-700 text-lg">
                Productos únicos: <span class="font-bold text-blue-600">{{ inventory.length }}</span>
            </p>
            <p class="text-gray-700 text-lg">
                Cantidad total de ítems: <span class="font-bold text-blue-600">
                    {{ inventory.reduce((sum, item) => sum + item.totalQuantity, 0) }}
                </span>
            </p>
        </div>

        <!-- Tarjeta de Alertas de Caducidad -->
        <div class="bg-white p-6 rounded-lg shadow-md border border-red-200 lg:col-span-2">
            <h2 class="text-xl font-semibold text-red-700 mb-4 flex items-center">
                <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Alertas: Productos Próximos a Caducar (FIFO)
            </h2>
            <div *ngIf="expiringLots.length === 0" class="text-green-600 font-medium">
                🎉 ¡Excelente! No hay productos próximos a caducar en los próximos 30 días.
            </div>
            <div *ngIf="expiringLots.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cantidad
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Caducidad
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoría
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let lot of expiringLots" [class.bg-red-100]="isCritical(lot.expirationDate)">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                                [class.text-red-700]="isCritical(lot.expirationDate)">
                                {{ lot.productId.name }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ lot.quantity }} {{ lot.productId.unit || 'unidades' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm"
                                [class.text-red-700]="isCritical(lot.expirationDate)">
                                {{ lot.expirationDate | date:'dd/MM/yyyy' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ lot.productId.category }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Visualización del Inventario por Categoría y FIFO -->
    <h2 class="text-2xl font-bold text-gray-800 mb-5 text-center">📦 Inventario por Categoría y Lotes (Prioridad FIFO)</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let item of inventory" class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 class="text-xl font-semibold text-gray-800 mb-3">{{ item.name }} ({{ item.category }})</h3>
            <p class="text-gray-600 mb-2">Cantidad Total: <span class="font-bold">{{ item.totalQuantity }} {{ item.unit || 'unidades' }}</span></p>
            <p class="text-gray-600 mb-3">{{ item.description }}</p>

            <h4 class="text-md font-semibold text-gray-700 mb-2">Lotes Disponibles:</h4>
            <div *ngIf="item.lots.length === 0" class="text-sm text-gray-500 italic">No hay lotes para este producto.</div>
            <ul *ngIf="item.lots.length > 0" class="divide-y divide-gray-100">
                <li *ngFor="let lot of item.lots" class="py-2 text-sm" [class.text-red-600]="isCritical(lot.expirationDate)">
                    - Cantidad: {{ lot.quantity }} {{ item.unit || 'unidades' }} | Caducidad:
                    <span class="font-medium">{{ lot.expirationDate | date:'dd/MM/yyyy' }}</span>
                    <span *ngIf="lot.batchNumber" class="text-gray-500 ml-2">(Lote: {{ lot.batchNumber }})</span>
                </li>
            </ul>
        </div>
    </div>
</div>
```css
/* frontend/src/app/pages/dashboard/dashboard.component.css */
/* Tailwind CSS se cargará globalmente, aquí solo se añaden estilos específicos */
.container {
    max-width: 1200px;
}

.text-red-700 {
    color: #b91c1c; /* Un rojo más oscuro para texto crítico */
}

.bg-red-100 {
    background-color: #fee2e2; /* Un fondo rojo claro para filas críticas */
}