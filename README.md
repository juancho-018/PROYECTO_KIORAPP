# 🍰 Kiora – Panel Administrativo Frontend

<<<<<<< Updated upstream
<<<<<<< Updated upstream
**Kiora** es el ecosistema frontend centralizado para la gestión del sistema de microservicios. Esta aplicación integra los módulos de **Administración**, **Autenticación**, **Seguridad** y **Soporte** bajo una arquitectura robusta de **Astro v5** y **React v19**.
=======
=======
>>>>>>> Stashed changes
<div align="center">

**Sistema integral de gestión para negocios de alimentos**  
*Punto de Venta · Inventario · Ventas · Facturación · Usuarios*

![Astro](https://img.shields.io/badge/Astro-v5.17-BC52EE?style=for-the-badge&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-v4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

</div>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

---

## 📋 Descripción

**Kiora** es el frontend del ecosistema de microservicios para la gestión integral de un negocio de alimentos. Centraliza los módulos de **Administración**, **Inventario**, **Punto de Venta (POS)**, **Facturación**, **Incidencias** y **Seguridad** bajo una arquitectura moderna basada en **Astro v5** + **React v19**.

### Características principales

- 🏠 **Dashboard** con resumen de ventas en tiempo real, insights de IA y alertas de stock crítico
- 📦 **Catálogo de Productos** con gestión de categorías, stock, imágenes y búsqueda inteligente (Fuse.js)
- 🛒 **Punto de Venta (POS)** con carrito persistente, métodos de pago y procesamiento ágil
- 📊 **Módulo de Ventas** con tablas, paginación, facturas, movimientos de inventario e incidencias
- 👥 **Gestión de Usuarios** con roles, bloqueos, desbloqueos y auditoría
- 🔧 **Mantenimiento** con Health Check de microservicios y configuración del sistema
- 💳 **Integración con Stripe** para pagos con tarjeta
- 🌐 **PWA** con soporte offline y manifest para instalación nativa
- 🔒 **Autenticación JWT** con gestión de sesiones, recuperación de contraseña y verificación por código

---

## 📂 Arquitectura del Proyecto

```
src/
<<<<<<< Updated upstream
<<<<<<< Updated upstream
├── components/             # Capa de Presentación (React)
│   ├── auth/               # Login, Recuperación y Reseteo de Password
│   ├── panel/              # Dashboard Administrativo Modular
│   ├── help/               # Centro de Ayuda y FAQ
│   ├── ui/                 # Componentes Globales (Loading, Controles)
│   └── icono.jsx           # Activos Visuales Base
├── core/                   # Abstracciones de Infraestructura (HttpClient)
├── services/               # Lógica de Negocio (Auth, Users, Session)
├── models/                 # Contratos de Datos e Interfaces TS
├── pages/                  # Orquestación de Rutas (Astro)
└── styles/                 # Configuración de Tailwind v4 y Global CSS
=======
=======
>>>>>>> Stashed changes
├── components/                # Capa de Presentación (React)
│   ├── auth/                  # Login, Recuperar contraseña, Verificación
│   ├── panel/                 # Dashboard Administrativo (38 componentes)
│   │   ├── PanelApp.tsx       # Orquestador principal del panel
│   │   ├── AdminNavbar.tsx    # Barra superior con notificaciones y perfil
│   │   ├── AdminSubNav.tsx    # Sidebar vertical de navegación (dock)
│   │   ├── DashboardSection   # Resumen del día + Insights IA
│   │   ├── ProductsSection    # Catálogo CRUD con búsqueda difusa
│   │   ├── SalesSection       # Ventas, facturas, movimientos, incidencias
│   │   ├── OrderDrawer        # Punto de Venta (POS) con carrito
│   │   ├── InventorySection   # Gestión de stock y movimientos
│   │   └── ...                # +30 componentes modulares
│   ├── help/                  # Centro de Ayuda (FAQs)
│   └── ui/                    # Componentes transversales (Loader, Icons)
├── core/                      # Infraestructura (HttpClient con interceptors)
├── services/                  # Lógica de Negocio
│   ├── AuthService.ts         # Autenticación JWT + refresh tokens
│   ├── ProductService.ts      # CRUD productos, categorías, stock
│   ├── OrderService.ts        # Pedidos, facturas, exportación Excel/PDF
│   ├── InventoryService.ts    # Movimientos de inventario
│   ├── IncidentService.ts     # Reporte de incidencias
│   └── MaintenanceService.ts  # Health checks de microservicios
├── models/                    # Interfaces TypeScript (Product, Order, User...)
├── context/                   # React Context (StockProvider)
├── pages/                     # Rutas Astro (.astro)
├── styles/                    # Tailwind v4 + CSS global
└── utils/                     # Utilidades (paginación, errores, búsqueda)
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
```

---

## 🚀 Inicio Rápido

<<<<<<< Updated upstream
<<<<<<< Updated upstream
Para una explicación profunda de la arquitectura y patrones utilizados, consulta:
👉 **[TECHNICAL_DOCS.md](./src/TECHNICAL_DOCS.md)**  
👉 **[Seguridad (modelo de amenazas del cliente)](./SECURITY.md)**
=======
### Prerrequisitos
>>>>>>> Stashed changes
=======
### Prerrequisitos
>>>>>>> Stashed changes

- **Node.js** ≥ 18
- **npm** ≥ 9
- Backend de microservicios corriendo (API Gateway en puerto `3000`)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/kiora-frontend.git
cd kiora-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env → PUBLIC_API_URL=http://localhost:3000/api
```

### Desarrollo Local
<<<<<<< Updated upstream
<<<<<<< Updated upstream
1. **Instalar dependencias:** `npm install`
2. **Configurar entorno:** `cp .env.example .env` (opcional: `PUBLIC_WEGLOT_API_KEY` si usas traducción Weglot)
3. **Ejecutar:** `npm run dev`
=======
>>>>>>> Stashed changes

```bash
<<<<<<< Updated upstream
# Construir y levantar todo el ecosistema front
=======
=======

```bash
>>>>>>> Stashed changes
npm run dev
# → http://localhost:8080
```

### Build de Producción

```bash
npm run build
npm run preview
```

### Tests

```bash
# Ejecutar suite de tests
npm run test

# Tests con cobertura
npm run test -- --coverage
```

### Docker

```bash
# Construir y levantar (puerto 8080)
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
docker-compose up -d --build
```

---

## 🛠️ Stack Tecnológico

<<<<<<< Updated upstream
<<<<<<< Updated upstream
- **Clean Architecture**: Separación estricta entre UI e Infraestructura.
- **SOLID**: Código mantenible, extensible y testeable.
- **Performance**: Hidratación selectiva de componentes React mediante Astro.
- **Premium UI**: Diseño consistente basado en tokens de marca (Kiora Red).
=======
=======
>>>>>>> Stashed changes
| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework SSR** | Astro | v5.17 |
| **UI Library** | React | v19.2 |
| **Estilos** | Tailwind CSS | v4.2 |
| **Lenguaje** | TypeScript | Strict |
| **Testing** | Vitest + Testing Library | v4.0 |
| **Accesibilidad** | axe-core/react | v4.11 |
| **Búsqueda** | Fuse.js | v7.3 |
| **Pagos** | Stripe.js | v9.2 |
| **PWA** | @vite-pwa/astro | v1.2 |
| **Bundler** | Vite | v6+ |
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

---

## 📐 Principios de Ingeniería

<<<<<<< Updated upstream
<<<<<<< Updated upstream
- **Logs de Build**: Revisa `build.log` o `tsc.log` para errores de compilación o tipos.
- **Sesiones**: Si experimentas desconexiones inesperadas, verifica la configuración de `SessionManager.ts`.
- **API**: Asegúrate de que `PUBLIC_API_URL` en tu `.env` apunte al backend correcto.
- **Seguridad**: Lee [SECURITY.md](./SECURITY.md) antes de desplegar en producción (sesión, JWT, CSP).
=======
=======
>>>>>>> Stashed changes
- **Clean Architecture** – Separación estricta entre UI, servicios e infraestructura
- **Microservices Oriented** – Comunicación vía API Gateway centralizado
- **Component-Driven** – 38+ componentes modulares reutilizables en el panel
- **Type Safety** – TypeScript estricto con modelos tipados para todo el dominio
- **PWA Ready** – Service Worker, manifest y soporte offline
- **Premium UI** – Diseño consistente con tokens de marca (Kiora Red `#ec131e`, Brown `#3E2723`)

---

## 📖 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [src/README.md](./src/README.md) | Guía técnica de la arquitectura interna |
| [TECHNICAL_DOCS.md](./src/TECHNICAL_DOCS.md) | Documentación técnica detallada |
| [SECURITY.md](./SECURITY.md) | Modelo de amenazas y políticas de seguridad |

---

## 🔗 Comunicación con Backend

El frontend se comunica con el ecosistema de microservicios a través de un **API Gateway** (puerto `3000`):

```
Frontend (8080) ──► API Gateway (3000) ──┬── auth-service
                                         ├── product-service
                                         ├── order-service
                                         ├── inventory-service
                                         ├── reports-service
                                         └── notification-service
```

> **Nota:** Asegúrate de que el Gateway esté corriendo antes de iniciar el frontend. Los PDFs de ventas se generan dinámicamente conectando con el `reports-service`.

---

## 👥 Equipo

Desarrollado por el equipo **Kiora** – Universidad.

---

<div align="center">
  <sub>Hecho con ❤️ por el equipo Kiora</sub>
</div>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
