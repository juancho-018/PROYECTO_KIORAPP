# Source Code (`src/`) - Developer Guide

Esta carpeta contiene el núcleo lógico y visual de la aplicación. Se sigue un patrón de separación de responsabilidades estricto.

## Estructura de Directorios

### 📂 [`components/`](./components/)
Contiene todos los componentes de React (`.tsx`, `.jsx`).
- **`auth/`**: Componentes del flujo de seguridad (Login, Password Reset).
- **`panel/`**: Componentes modulares del Dashboard administrativo (Navbar, Listas, Drawers).
- **`help/`**: Centro de soporte al usuario.
- **`ui/`**: Componentes transversales y atómicos.

### 📂 [`core/`](./core/)
Abstracciones de infraestructura y herramientas compartidas.
- **`http/`**: Cliente base para comunicaciones con la API (`HttpClient.ts`).
- **`ui/`**: Notificaciones globales (Alertas).

### 📂 [`services/`](./services/)
Casos de uso y lógica de negocio.
Aquí se definen las reglas de negocio (ej. "Cómo validar una sesión") independientemente de cómo se muestren en la UI.

### 📂 [`models/`](./models/)
Interfaces y tipos de TypeScript que definen los contratos de datos del sistema.

### 📂 [`pages/`](./pages/)
Rutas de la aplicación gestionadas por **Astro**.
Cada archivo `.astro` inicializa los componentes de React necesarios para esa ruta.

### 📂 [`styles/`](./styles/)
Configuración global de **Tailwind CSS v4** y estilos base de la aplicación.

### 📂 [`config/`](./config/)
Configuración de entorno e instanciación de servicios globales (`setup.ts`).

---

## 📘 Documentación Técnica
Para detalles sobre patrones de diseño, servicios y arquitectura modular:
👉 **[TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md)**

---

## 💡 Reglas para Desarrolladores

1.  **Modularidad**: No crees componentes gigantes en `pages/`. Usa la carpeta `components/` y subdivide si es necesario.
2.  **Lógica Extraída**: Toda llamada a la API debe vivir en un `Service`, no directamente en el componente React.
3.  **Tipado**: Usa siempre las interfaces de `models/` para garantizar la consistencia de los datos.
4.  **Estilos**: Evita el CSS plano; utiliza las clases de utilidad de Tailwind v4 y los tokens de marca.
