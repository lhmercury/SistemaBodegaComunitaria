Sistema de Inventario para Bodegas Comunitarias

📝 Descripción del Proyecto

Este proyecto es una herramienta digital de gestión de inventario inteligente, diseñada específicamente para las bodegas comunitarias. Su objetivo principal es optimizar la gestión de productos perecederos, minimizando las pérdidas por desperdicio. El sistema implementa una lógica de inventario **FIFO (First In, First Out)**, priorizando la distribución de los productos que tienen la fecha de caducidad más cercana.

Permite a los encargados registrar productos con múltiples lotes, visualizar el inventario de forma segmentada (por categoría y lotes) y recibir alertas tempranas sobre productos que están próximos a caducar.

-----

 ✨ Características Principales

  * Gestión de Productos por Lotes: Permite registrar múltiples lotes para un mismo producto, cada uno con su propia cantidad y fecha de caducidad.
  * Lógica FIFO: El inventario se visualiza priorizando los lotes con la fecha de caducidad más próxima, facilitando el consumo y la distribución ordenada.
  * Sistema de Alertas Tempranas: Genera notificaciones proactivas sobre los productos que están a punto de caducar, lo que ayuda a evitar pérdidas.
  * Dashboard Interactivo: Ofrece una visión general del inventario con un resumen y una sección destacada para las alertas de caducidad.
  * Filtros y Búsqueda: Permite buscar y filtrar el inventario por nombre, categoría y descripción para una gestión más eficiente.
  * API RESTful: Un backend robusto que maneja toda la lógica de negocio y la persistencia de datos.


 🛠️ Tecnologías Utilizadas

Backend

  * Node.js: Entorno de ejecución de JavaScript del lado del servidor.
  * Express: Framework web para la creación de la API REST.
  * TypeScript: Lenguaje de programación que añade tipado estático al código.
  * MongoDB: Base de datos NoSQL para el almacenamiento de datos flexible.
  * Mongoose: Librería de modelado de objetos para MongoDB.

Frontend

  * Angular: Framework para la construcción de la interfaz de usuario.
  * TypeScript: Utilizado en el desarrollo del frontend para mayor robustez.
  * Tailwind CSS: Framework de CSS para un desarrollo de interfaz rápido y modular.
  * RxJS: Para la gestión de la lógica asíncrona (peticiones HTTP).

🚀 Guía de Instalación y Ejecución

Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu máquina:

  * [Node.js](https://nodejs.org/) (versión LTS) y npm
  * [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
  * [MongoDB Community Server](https://www.mongodb.com/try/download/community)
  * [Visual Studio Code](https://code.visualstudio.com/) (opcional, pero recomendado)

1\. Clonar el Repositorio

Abre tu terminal y clona el proyecto:

bash
git clone https://github.com/tu_usuario/inventario-bodega.git
cd inventario-bodega


2\. Configuración e Inicio del Backend

El backend se encuentra en la carpeta `backend`.

bash
cd backend
npm install


Una vez que las dependencias estén instaladas, crea un archivo de variables de entorno llamado `.env` en la misma carpeta `backend` y añade la siguiente línea:

env
env
MONGODB_URI=mongodb://localhost:27017/inventario-bodega
PORT=3000


Ahora, puedes iniciar el servidor:

bash
npm run dev


Verás un mensaje en la consola indicando que el servidor está en ejecución en `http://localhost:3000`.

3\. Configuración e Inicio del Frontend

Abre una **nueva terminal** y navega a la carpeta del frontend:

bash
cd ../frontend
npm install


Una vez que las dependencias estén instaladas, inicia la aplicación de Angular:

bash
ng serve --open


Esto compilará la aplicación y la abrirá automáticamente en tu navegador en `http://localhost:4200`.


🗺️ Estructura del Proyecto

El proyecto está organizado como un monorepo para una gestión unificada del código.

```
/inventario-bodega
├── /backend            # Servidor Node.js (API REST)
│   ├── /src            # Código fuente del backend
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── /frontend           # Aplicación Angular
│   ├── /src            # Código fuente del frontend
│   ├── angular.json
│   └── package.json
```

-----

 📄 Documentación de la API

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/inventory` | Obtiene el inventario completo, agrupado por producto y lotes (con lógica FIFO). |
| `GET` | `/api/alerts/expiring` | Obtiene la lista de lotes próximos a caducar, ordenados por fecha. |
| `POST` | `/api/products` | Crea un nuevo producto. |
| `POST` | `/api/products/:productId/lots` | Añade un nuevo lote a un producto existente. |
| `PUT` | `/api/lots/:lotId` | Actualiza la cantidad de un lote (para registrar el consumo). |
| `DELETE` | `/api/lots/:lotId` | Elimina un lote del inventario. |
| `GET` | `/api/products/:productId` | Obtiene los detalles de un producto específico y todos sus lotes. |


💻 Capturas de Pantalla



 Dashboard: Muestra el resumen del inventario y las alertas de caducidad.
 Gestión de Productos: Muestra los formularios para añadir productos y lotes.
 Listado de Inventario: Muestra la tabla detallada de productos y sus lotes.



📄 Licencia

Este proyecto está bajo la Licencia
