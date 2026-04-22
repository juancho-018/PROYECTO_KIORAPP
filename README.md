# 🍰 Kiora – Panel Administrativo Frontend



**Sistema integral de gestión para kiosko**  
*Punto de Venta · Inventario · Ventas · Facturación · Usuarios*

![Astro](https://img.shields.io/badge/Astro-v5.17-BC52EE?style=for-the-badge&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-v4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

<<<<<<< HEAD
=======
**Kiora** es el ecosistema frontend centralizado para la gestión integral del sistema de microservicios. Esta aplicación integra los módulos de **Administración**, **Inventario**, **Venta Directa (Kiosk)**, **Incidencias** y **Seguridad** bajo una arquitectura robusta de **Astro v5** y **React v19**.
>>>>>>> origin/develop

---

## 📋 Descripción

**Kiora** es el frontend de kiosko de microservicios para la gestión integral. Centraliza los módulos de **Administración**, **Inventario**, **Punto de Venta (POS)**, **Facturación**, **Incidencias** y **Seguridad** bajo una arquitectura moderna basada en **Astro v5** + **React v19**.

### Características principales

- 🏠 **Dashboard** con resumen de ventas en tiempo real, insights de IA y alertas de stock crítico.
- 📦 **Catálogo de Productos** con gestión de categorías, stock, imágenes y búsqueda inteligente.
- 🛒 **Punto de Venta (POS)** con carrito persistente y **validación de stock en tiempo real**.
- 📊 **Módulo de Ventas** con historial detallado, gestión de estados y **exportación a Excel/PDF**.
- 🧾 **Facturación Histórica** con registro contable y reportes descargables.
- 👥 **Gestión de Usuarios** con roles (Admin/Cliente-operador), reseteo de claves administrativo y bloqueos de seguridad.
- 🔧 **Mantenimiento** con reportes de incidencias técnicas y Health Check de servicios.
- 💳 **Integración con Stripe** para pagos electrónicos seguros.
- 🌐 **PWA** con soporte offline, manifest y etiquetas meta optimizadas.

---

## 📂 Arquitectura del Proyecto

```
src/
<<<<<<< HEAD
├── components/                # Capa de Presentación (React)
│   ├── auth/                  # Login, Recuperar contraseña, Verificación
│   ├── panel/                 # Dashboard Administrativo (38+ componentes)
│   │   ├── PanelApp.tsx       # Orquestador principal del panel
│   │   ├── AdminNavbar.tsx    # Barra superior con notificaciones y perfil
│   │   ├── AdminSubNav.tsx    # Sidebar lateral de navegación
│   │   ├── DashboardSection   # Resumen del día + Insights IA
│   │   ├── ProductsSection    # Catálogo CRUD con búsqueda difusa
│   │   ├── SalesSection       # Ventas, movimientos e incidencias
│   │   ├── OrdersSection      # Historial de pedidos y Facturación Histórica
│   │   ├── OrderDrawer        # Punto de Venta (POS) con carrito y validación de stock
│   │   └── ...                # Otros módulos (Inventory, Maintenance, Users...)
│   ├── help/                  # Centro de Ayuda (FAQs)
│   └── ui/                    # Componentes transversales (Loader, Icons)
├── core/                      # Infraestructura (HttpClient con interceptors)
├── services/                  # Lógica de Negocio
│   ├── AuthService.ts         # Autenticación JWT + reseteo administrativo
│   ├── OrderService.ts        # Pedidos, facturas, exportación Excel/PDF
│   ├── ProductService.ts      # CRUD productos, categorías, stock
│   └── ...                    # Inventory, Maintenance, Users
├── models/                    # Interfaces TypeScript (Product, Order, User...)
├── pages/                     # Rutas Astro (.astro)
├── styles/                    # Tailwind v4 + CSS global
└── utils/                     # Utilidades (paginación, errores, búsqueda)
=======
├── components/             # Capa de Presentación (React)
│   ├── auth/               # Seguridad (Login, Recover)
│   ├── panel/              # Dashboard Administrativo
│   ├── inventory/          # Gestión de stock y proveedores
│   ├── products/           # Catálogo y categorías
│   └── ui/                 # Componentes transversales
├── core/                   # Infraestructura (HttpClient)
├── services/               # Lógica de Negocio (Order, Product, Incident)
├── models/                 # Contratos de Datos e Interfaces TS
├── pages/                  # Orquestación de Rutas y PWA (Astro)
└── styles/                 # Tailwind v4 y Global CSS
>>>>>>> origin/develop
```

---

## 🚀 Inicio Rápido

<<<<<<< HEAD
### Prerrequisitos
=======
Para una explicación profunda de la arquitectura y patrones utilizados, consulta:
👉 **[Guía de Código (src/README.md)](./src/README.md)**  
👉 **[TECHNICAL_DOCS.md](./src/TECHNICAL_DOCS.md)**  
👉 **[Seguridad y Modelos de Amenaza](./SECURITY.md)**
>>>>>>> origin/develop

- **Node.js** ≥ 18
- **npm** ≥ 9
- Backend de microservicios corriendo (API Gateway en puerto `3001` o según configuración)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/kiora-frontend.git
cd kiora-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Asegúrate de que PUBLIC_API_URL apunte al Gateway correcto
```

### Desarrollo Local
<<<<<<< HEAD
=======
1. **Instalar dependencias:** `npm install`
2. **Configurar entorno:** `cp .env.example .env` (Verifica `PUBLIC_API_URL` apuntando al Gateway en puerto 3000)
3. **Ejecutar:** `npm run dev`
   - La aplicación corre por defecto en: **`http://localhost:8080`**
>>>>>>> origin/develop

```bash
<<<<<<< HEAD
npm run dev
# → http://localhost:8080
=======
# Construir y levantar todo el ecosistema front (Puerto 8080 expuesto)
docker-compose up -d --build
>>>>>>> origin/develop
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework SSR** | Astro | v5.17 |
| **UI Library** | React | v19.2 |
| **Estilos** | Tailwind CSS | v4.2 |
| **Reportes** | xlsx / jsPDF | Latest |
| **Testing** | Vitest + Testing Library | v4.0 |
| **Búsqueda** | Fuse.js | v7.3 |
| **PWA** | @vite-pwa/astro | v1.2 |

---

## 📐 Principios de Ingeniería

<<<<<<< HEAD
- **Clean Architecture** – Separación estricta entre UI, servicios e infraestructura.
- **Estado Inmutable** – Lógica de pedidos protegida contra reversiones accidentales (ej: ventas canceladas).
- **Validación Preventiva** – El POS bloquea acciones que excedan el stock físico disponible.
- **Type Safety** – TypeScript estricto para garantizar la integridad de los datos de inventario y ventas.
- **Premium UI** – Diseño consistente basado en tokens de marca (Kiora Red `#ec131e`).
=======
- **Clean Architecture**: Separación estricta entre UI e Infraestructura.
- **Microservices Oriented**: Comunicación optimizada a través de un API Gateway.
- **PWA (Progressive Web App)**: Soporte nativo para instalación y funcionamiento offline.
- **Premium UI**: Diseño consistente basado en tokens de marca (Kiora Red).
>>>>>>> origin/develop

---

## 📖 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [src/TECHNICAL_DOCS.md](./src/TECHNICAL_DOCS.md) | Documentación técnica detallada de la arquitectura |
| [SECURITY.md](./SECURITY.md) | Modelo de amenazas y políticas de seguridad |

---

<<<<<<< HEAD
=======
- **API**: Asegúrate de que el Gateway de microservicios (Puerto 3000) esté levantado para que el frontend funcione correctamente.
- **Incidencias**: Usa el módulo de Soporte para reportar fallos técnicos detectados en tiempo real.
- **Recibos**: Los PDFs de ventas se generan dinámicamente conectando con el `reports-service`.
>>>>>>> origin/develop
