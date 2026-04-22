# Documentación Técnica Global - Kiora Frontend

Este documento detalla la arquitectura, módulos y patrones técnicos de la aplicación frontend de Kiora, incluyendo las últimas actualizaciones de estabilidad y gestión de datos.

---

## 1. Arquitectura General

La aplicación sigue los principios de **Arquitectura Limpia**, separando la infraestructura de la lógica de negocio para facilitar el mantenimiento y la escalabilidad.

### Estructura de Capas
- **`src/core/`**: Infraestructura base. Cliente HTTP con interceptores de seguridad para manejo de tokens y errores 401.
- **`src/services/`**: Lógica de negocio (Casos de Uso). Aquí se gestiona la comunicación con los microservicios y la lógica de estados.
- **`src/models/`**: Contratos de datos (Interfaces TypeScript) compartidos en toda la aplicación.
- **`src/components/`**: Capa de presentación modular construida con React v19.

---

## 2. Módulos Destacados

### 2.1 Punto de Venta (POS) e Inventario
- **Validación en Cliente**: El `OrderDrawer.tsx` y `PanelApp.tsx` implementan validación reactiva de stock. No se permite agregar más unidades de las disponibles físicamente en el inventario actual.
- **Sincronización**: Al agregar productos al carrito, se almacena el `stock_actual` para garantizar que la validación persista incluso si el usuario aplica filtros de búsqueda.

### 2.2 Gestión de Ventas y Pedidos
- **Integridad de Estados**: Los pedidos marcados como "cancelados" entran en un estado de solo lectura. El sistema bloquea reversiones de estado para mantener la trazabilidad.
- **Facturación Histórica**: Sub-módulo dedicado a la visualización de registros contables definitivos, separado del flujo "live" de pedidos pendientes.

### 2.3 Reportes y Exportación
- **Motor de Excel**: Utiliza la librería `xlsx` para generar reportes dinámicos.
- **Exportación Contextual**: El sistema identifica automáticamente qué tipo de reporte generar (Ventas vs. Facturas) basándose en la pestaña activa del usuario.
- **PDFs**: Generación de tickets de venta y facturas legales mediante `jsPDF` y `autoTable`.

### 2.4 Seguridad Administrativa
- **Reseteo de Credenciales**: Los administradores pueden forzar el reseteo de contraseñas de otros usuarios mediante un flujo seguro de confirmación que invoca el endpoint administrativo del microservicio de autenticación.

---

## 3. Patrones de Diseño

### Saga y Compensación (Integración)
Aunque el frontend es reactivo, respeta la lógica de **Saga** del backend. Si el backend falla al descontar stock durante una transición a "completada", el frontend captura el error de conflicto (409) y notifica al usuario para evitar inconsistencias visuales.

### Inversión de Dependencias (DI)
Los servicios se inicializan en `src/config/setup.ts`. Esto permite que los componentes consuman una instancia única y configurada de cada servicio, facilitando la inyección de mocks durante las pruebas unitarias con Vitest.

---

## 4. Mantenimiento y Buenas Prácticas

1.  **Protección de Estados Finales**: Cualquier cambio destructivo (como cancelar una venta) debe requerir una confirmación explícita del usuario vía `AlertService`.
2.  **Manejo de Errores**: Se debe usar la utilidad `getErrorMessage` para parsear respuestas del servidor y mostrar mensajes legibles al usuario.
3.  **PWA**: El archivo `manifest.webmanifest` y los service workers deben ser verificados tras cada build para asegurar la capacidad de instalación del panel.

---

## 5. Mantenimiento del Proyecto

*   **Rendimiento**: Uso de `useCallback` en cargadores de datos para evitar re-renders innecesarios en tablas grandes.
*   **Diseño**: Seguir estrictamente el sistema de diseño "Kiora" basado en Tailwind CSS v4 para mantener la consistencia estética (Sombras suaves, bordes redondeados `2xl/3xl`, tipografía `Inter`).
