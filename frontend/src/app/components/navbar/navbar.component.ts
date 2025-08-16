// frontend/src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent { }
```html
<!-- frontend/src/app/components/navbar/navbar.component.html -->
<nav class="bg-gray-800 p-4 shadow-md">
    <div class="container mx-auto flex justify-between items-center">
        <a routerLink="/dashboard" class="text-white text-2xl font-bold flex items-center">
            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" class="h-8 w-8 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Inventario Comunitario
        </a>
        <div class="space-x-4">
            <a routerLink="/dashboard" routerLinkActive="text-blue-400" [routerLinkActiveOptions]="{exact: true}"
               class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out">
                Dashboard
            </a>
            <a routerLink="/inventory" routerLinkActive="text-blue-400"
               class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out">
                Inventario
            </a>
            <a routerLink="/products" routerLinkActive="text-blue-400"
               class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-300 ease-in-out">
                Gestión
            </a>
        </div>
    </div>
</nav>
```css
/* frontend/src/app/components/navbar/navbar.component.css */
/* No se necesitan estilos adicionales si se usa Tailwind directamente */