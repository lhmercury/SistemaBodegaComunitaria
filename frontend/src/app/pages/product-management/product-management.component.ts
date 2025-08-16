// frontend/src/app/pages/product-management/product-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, Lot } from '../../models/inventory.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {
  productForm: FormGroup;
  lotForm: FormGroup;
  products: Product[] = []; // Lista de productos para seleccionar al añadir lote
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private productService: ProductService) {
    // Inicialización del formulario de producto
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      unit: ['']
    });

    // Inicialización del formulario de lote
    this.lotForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      expirationDate: ['', Validators.required],
      batchNumber: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts(); // Carga los productos al iniciar para el selector de lotes
  }

  loadProducts(): void {
    // Aquí podrías tener un servicio que solo traiga productos sin lotes para este selector
    // Para simplificar, obtenemos todo el inventario y extraemos los productos únicos
    this.productService.getInventory().subscribe({
      next: (inventoryItems) => {
        this.products = inventoryItems.map(item => ({
          _id: item._id,
          name: item.name,
          category: item.category,
          description: item.description,
          unit: item.unit
        }));
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.errorMessage = 'No se pudieron cargar los productos para añadir lotes.';
      }
    });
  }

  onSubmitProduct(): void {
    this.resetMessages();
    if (this.productForm.valid) {
      this.productService.addProduct(this.productForm.value).subscribe({
        next: (product) => {
          this.successMessage = `Producto '${product.name}' añadido con éxito.`;
          this.productForm.reset();
          this.loadProducts(); // Recargar la lista de productos para el selector de lotes
        },
        error: (err) => {
          console.error('Error al añadir producto:', err);
          this.errorMessage = err.error?.message || 'Error al añadir el producto.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos requeridos del producto.';
    }
  }

  onSubmitLot(): void {
    this.resetMessages();
    if (this.lotForm.valid) {
      const { productId, quantity, expirationDate, batchNumber } = this.lotForm.value;
      const lotData: Partial<Lot> = {
        quantity: quantity,
        expirationDate: new Date(expirationDate), // Asegurarse de que sea un objeto Date
        batchNumber: batchNumber
      };

      this.productService.addLot(productId, lotData).subscribe({
        next: (lot) => {
          this.successMessage = `Lote añadido con éxito para el producto ID: ${lot.productId}.`;
          this.lotForm.reset({ productId: '', quantity: 0, expirationDate: '', batchNumber: '' });
        },
        error: (err) => {
          console.error('Error al añadir lote:', err);
          this.errorMessage = err.error?.message || 'Error al añadir el lote.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos requeridos del lote.';
    }
  }

  resetMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}
```html
<!-- frontend/src/app/pages/product-management/product-management.component.html -->
<div class="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen rounded-lg shadow-md">
    <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">➕ Gestión de Productos y Lotes</h1>

    <div *ngIf="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded" role="alert">
        <p class="font-bold">¡Éxito!</p>
        <p>{{ successMessage }}</p>
    </div>
    <div *ngIf="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
        <p class="font-bold">¡Error!</p>
        <p>{{ errorMessage }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Formulario para Añadir Nuevo Producto -->
        <div class="bg-white p-6 rounded-lg shadow-md border border-indigo-200">
            <h2 class="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
                <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Añadir Nuevo Producto
            </h2>
            <form [formGroup]="productForm" (ngSubmit)="onSubmitProduct()" class="space-y-4">
                <div>
                    <label for="productName" class="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                    <input type="text" id="productName" formControlName="name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <div *ngIf="productForm.get('name')?.invalid && (productForm.get('name')?.dirty || productForm.get('name')?.touched)" class="text-red-500 text-xs mt-1">
                        El nombre del producto es requerido.
                    </div>
                </div>
                <div>
                    <label for="productCategory" class="block text-sm font-medium text-gray-700">Categoría</label>
                    <input type="text" id="productCategory" formControlName="category" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <div *ngIf="productForm.get('category')?.invalid && (productForm.get('category')?.dirty || productForm.get('category')?.touched)" class="text-red-500 text-xs mt-1">
                        La categoría es requerida.
                    </div>
                </div>
                <div>
                    <label for="productDescription" class="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea id="productDescription" formControlName="description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
                <div>
                    <label for="productUnit" class="block text-sm font-medium text-gray-700">Unidad de Medida (Ej: kg, litros, unidades)</label>
                    <input type="text" id="productUnit" formControlName="unit" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <button type="submit" [disabled]="!productForm.valid" class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Añadir Producto
                </button>
            </form>
        </div>

        <!-- Formulario para Añadir Lote a Producto Existente -->
        <div class="bg-white p-6 rounded-lg shadow-md border border-green-200">
            <h2 class="text-xl font-semibold text-green-700 mb-4 flex items-center">
                <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Añadir Lote
            </h2>
            <form [formGroup]="lotForm" (ngSubmit)="onSubmitLot()" class="space-y-4">
                <div>
                    <label for="selectProduct" class="block text-sm font-medium text-gray-700">Seleccionar Producto</label>
                    <select id="selectProduct" formControlName="productId" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm">
                        <option value="">-- Seleccione un Producto --</option>
                        <option *ngFor="let product of products" [value]="product._id">{{ product.name }} ({{ product.category }})</option>
                    </select>
                    <div *ngIf="lotForm.get('productId')?.invalid && (lotForm.get('productId')?.dirty || lotForm.get('productId')?.touched)" class="text-red-500 text-xs mt-1">
                        Debe seleccionar un producto.
                    </div>
                </div>
                <div>
                    <label for="lotQuantity" class="block text-sm font-medium text-gray-700">Cantidad</label>
                    <input type="number" id="lotQuantity" formControlName="quantity" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm">
                    <div *ngIf="lotForm.get('quantity')?.invalid && (lotForm.get('quantity')?.dirty || lotForm.get('quantity')?.touched)" class="text-red-500 text-xs mt-1">
                        La cantidad es requerida y debe ser mayor que 0.
                    </div>
                </div>
                <div>
                    <label for="expirationDate" class="block text-sm font-medium text-gray-700">Fecha de Caducidad</label>
                    <input type="date" id="expirationDate" formControlName="expirationDate" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm">
                    <div *ngIf="lotForm.get('expirationDate')?.invalid && (lotForm.get('expirationDate')?.dirty || lotForm.get('expirationDate')?.touched)" class="text-red-500 text-xs mt-1">
                        La fecha de caducidad es requerida.
                    </div>
                </div>
                <div>
                    <label for="batchNumber" class="block text-sm font-medium text-gray-700">Número de Lote (Opcional)</label>
                    <input type="text" id="batchNumber" formControlName="batchNumber" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm">
                </div>
                <button type="submit" [disabled]="!lotForm.valid" class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Añadir Lote
                </button>
            </form>
        </div>
    </div>
</div>
```css
/* frontend/src/app/pages/product-management/product-management.component.css */
/* Estilos adicionales si son necesarios, además de Tailwind */