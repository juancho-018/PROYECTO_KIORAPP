# Documentation Técnica Global - Kiora Frontend

Este documento detalla la arquitectura, módulos y patrones técnicos de **toda** la aplicación frontend de Kiora.

---

## 1. Arquitectura General

La aplicación está construida con **Astro v5** y **React v19**. Sigue los principios de **Arquitectura Limpia** para separar la infraestructura de la lógica de negocio.

### Estructura de Capas
- **`src/core/`**: Infraestructura base. Cliente HTTP genérico y servicios de bajo nivel.
- **`src/services/`**: Casos de uso y reglas de negocio. Independientes del framework.
- **`src/models/`**: Definiciones de datos e interfaces TypeScript.
- **`src/components/`**: Capa de presentación modular en React.

---

## 2. Módulos del Sistema

### 2.1 Módulo de Autenticación (`src/components/auth/`)
Gestiona todo el flujo de acceso y seguridad:
- **`LoginForm.tsx`**: Validación de credenciales y establecimiento de sesión.
- **`RecoverPasswordForm.tsx`**: Proceso de solicitud de recuperación vía email.
- **`AuthService.ts`**: Lógica de persistencia de tokens JWT.

### 2.2 Módulo de Inventario (`src/components/inventory/`)
Control de existencias y logística:
- **`InventoryService.ts`**: API para movimientos de stock, gestión de proveedores y alertas de stock mínimo.
- **`Movement` / `Supplier`**: Modelos de datos para trazabilidad logística.

### 2.3 Módulo de Productos (`src/components/products/`)
Gestión del catálogo comercial:
- **`ProductService.ts`**: Operaciones CRUD para productos y categorías. Nota: Se corrigió la propiedad `fk_cod_cat` para sincronizar con el backend.
- **Categorización**: Soporte para filtrado y subida de imágenes (Multer en el BE).

### 2.4 Módulo de Ventas y Facturación (`src/services/OrderService.ts`)
Procesamiento de transacciones:
- **Flujo de Pago**: Soporte para métodos de pago (Efectivo/Stripe).
- **Generación de Recibos**: Integración con el `reports-service` para descarga de PDFs dinámicos.

### 2.5 Módulo de Incidencias (`src/services/IncidentService.ts`)
Soporte técnico y reportes:
- Permite a operadores y administradores crear reportes de fallos en el sistema.
- Consumido a través de la ruta `/incidents` del Gateway.

---

## 3. Integración y Gateway

La aplicación se comunica de forma centralizada con el **API Gateway** en el puerto **3000**.

- **URL de Base**: Definida en `setup.ts`.
- **Estrategia de Sincronización**: El frontend se adapta estrictamente a los contratos del backend (ej. uso de `PUT` para actualización de estados de ventas).
- **Funciones Pendientes**: Los módulos de Mantenimiento y Exportación masiva están documentados como placeholders hasta que el backend implemente los microservicios correspondientes.

---

## 4. Tecnologías y Estándares

### 4.1 PWA (Progressive Web App)
La aplicación soporta instalación nativa mediante:
- **Web Manifest**: Definido en `public/manifest.webmanifest`.
- **Service Worker**: Gestionado vía Astro para soporte offline básico.

### 4.2 UI y Estilos
- **Tailwind CSS v4**: Motor de estilos por utilidad de alto rendimiento.
- **SweetAlert2**: Estandarización de feedbacks y alertas de sistema.

---

## 5. Mantenimiento del Proyecto

1. **Lógica en Servicios**: Las llamadas a la API (`fetch`) están prohibidas dentro de los componentes. Deben pasar siempre por un `Service`.
2. **Consistencia Visual**: Utilizar siempre los tokens de color definidos en `global.css`.
3. **Desarrollo Local**: El servidor de desarrollo corre en el puerto **8080** (configurado en `astro.config.mjs`).

