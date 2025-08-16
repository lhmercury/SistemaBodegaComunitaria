// frontend/src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importar módulos de formularios

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard/dashboard.component';
import { ProductManagementComponent } from './pages/product-management/product-management.component';
import { InventoryListComponent } from './pages/inventory-list/inventory-list.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ProductManagementComponent,
    InventoryListComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // Añadir HttpClientModule aquí
    FormsModule,        // Para formularios basados en plantillas
    ReactiveFormsModule // Para formularios reactivos (más robustos)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }