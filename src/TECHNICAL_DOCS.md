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
- **`ResetPasswordForm.tsx`**: Formulario seguro para establecer una nueva contraseña mediante tokens.
- **`EmailSentMessage.tsx`**: Feedback visual tras acciones de recuperación.

### 2.2 Módulo Administrativo (`src/components/panel/`)
El núcleo de gestión del sistema (Refactorizado):
- **`PanelApp.tsx`**: Orquestador principal del dashboard.
- **`UserList.tsx`**: Lista paginada de usuarios con filtro **solo sobre la página cargada** (no sustituye búsqueda global en API).
- **`UserDrawer` / `ProfileDrawer`**: Gestión de datos mediante paneles laterales (Offcanvas).
- **`AdminNavbar` / `AdminSubNav`**: Sistema de navegación multinivel.

### 2.3 Módulo de Ayuda (`src/components/help/`)
- **`HelpCenter.tsx`**: Centro de soporte para usuarios, con preguntas frecuentes y guías de uso.

### 2.4 Módulo Global y UI (`src/components/ui/`)
- **`GlobalControls.tsx`**: Controles transversales a toda la aplicación.
- **`cargando.jsx`**: Sistema de feedback de carga (Loading overlays).

---

## 3. Patrones de Diseño Implementados

### SRP (Principio de Responsabilidad Única)
Cada componente tiene una función clara. Por ejemplo, `AuthService` solo sabe de tokens y logins, mientras que `SessionManager` solo sabe de tiempos de expiración e inactividad.

### DIP (Inversión de Dependencias)
Los componentes no instancian sus servicios. Los servicios se inyectan o se importan desde una capa de configuración (`src/config/setup.ts`), facilitando el reemplazo de implementaciones (ej. cambiar Fetch por Axios).

### Inmutabilidad y Memoización
Se utiliza `useMemo` y `useCallback` en el Panel Administrativo para garantizar que el filtrado de grandes listas de usuarios no impacte el rendimiento de la UI.

---

## 4. Tecnologías Clave
- **Astro**: Ruteo de alto rendimiento y optimización de assets.
- **Tailwind CSS v4**: Estilizado mediante utilidades modernas y variables CSS.
- **SweetAlert2**: Sistema de notificaciones y confirmaciones de alta calidad.
- **TypeScript**: Tipado estricto para reducir errores en tiempo de desarrollo.

---

## 5. Mantenimiento del Proyecto

1. **Evitar Monolitos**: Si un componente React supera las 250 líneas, debe ser dividido en sub-componentes.
2. **Lógica en Servicios**: Las llamadas a la API (`fetch`) está prohibidas dentro de los componentes. Deben pasar siempre por un `Service`.
3. **Consistencia Visual**: Utilizar siempre los tokens de color definidos en `global.css` (Ej. `--color-kiora-red`).
