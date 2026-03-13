# Kiora - Frontend Panel

Kiora es una aplicación desarrollada con **Astro**, utilizando **React** para la renderización de micro-componentes de recambio, **Tailwind CSS** para los estilos globales y estructurada empleando de forma estricta los principios de **Arquitectura Limpia y Principios SOLID**.

## 🛠️ Stack Tecnológico

- **Framework principal:** [Astro](https://astro.build/) v5
- **Renderizado UI:** [React](https://react.dev/) v19
- **Estilado:** [Tailwind CSS](https://tailwindcss.com/) v4
- **Feedback UI Alerts:** [SweetAlert2](https://sweetalert2.github.io/)
- **Lenguaje:** TypeScript estricto.

## 🏗️ Arquitectura y Principios SOLID

Este proyecto está construido para ser escalable, testeable e independiente de librerías concretas. No toleramos la lógica espagueti dentro de las plantillas (Views). 

### Estructura de Directorios Clave

```text
/src
├── core/         # Abstracciones de infraestructura (HttpClient.ts, AlertService.ts) [Principios DIP/SRP]
├── services/     # Casos de uso de negocio y reglas (AuthService.ts, UserService.ts) [Principio SRP]
├── views/        # Patrón Model-View-Presenter (MVP). Presentadores (Orquestadores) y Vistas puras (manipulación aislada del DOM)
├── pages/        # Rutas de Astro (.astro). Actúan simplemente como inicializadoras del MVP y plantillas maestras.
├── components/   # Componentes puros de React (ej: cargando.jsx)
└── hooks/        # Hooks reactivos (React) para componentes
```

- **(S) Responsabilidad Única:** Toda clase cumple un único fin. Una vista (ej. `PanelView.ts`) jamás procesa pagos o valida tokens. Un servicio (ej. `SessionManager.ts`) jamás manipula clases CSS (`.classList`).
- **(D) Inversión de Dependencias:** El código vital no depende del navegador, depende de abstracciones (interfaces como `IHttpClient`), lo que permite el día de mañana cambiar `Fetch` por `Axios` sin tocar `AuthService.ts`.

---

## 🚀 Guía de Inicio y Despliegue

### Requisitos Previos (Para Entorno de Desarrollo)
- **Node.js** v20 o superior.
- Crear un archivo `.env` en la raíz (usa `.env.example` como plantilla).

### Ejecución Local

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```

2. **Levantar el Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```
   *La aplicación estará disponible en [http://localhost:4321](http://localhost:4321).*

3. **Construir para Producción (Check Tipos TS):**
   ```bash
   npm run build
   ```

### 🐳 Despliegue con Docker (Producción)

El proyecto viene con un `Dockerfile` optimizado en 2 etapas (Multistage) que compila el portal con Node y luego sirve los estáticos mediante un contenedor ligero **Nginx**.

1. **Construir la imagen de Docker:**
   ```bash
   docker build -t kiora-frontend .
   ```

2. **Ejecutar el contenedor web:**
   ```bash
   docker run -p 3000:80 -d kiora-frontend
   ```
   *El panel público estará servido mediante Nginx en [http://localhost:3000](http://localhost:3000).*

---

## 🔐 Variables de Entorno

Tus variables de entorno para Astro que sean legibles por el cliente deben empezar por el prefijo `PUBLIC_`. Asegúrate de generar un archivo `.env` localmente o en tu entorno CI/CD. Ej:
```env
PUBLIC_API_URL=http://tu-backend-api.com/api
```

## 👥 Guía para Nuevos Programadores
Si necesitas extender este repositorio:
1. **Regla de Oro:** Si añades una página nueva (ej `src/pages/dashboard.astro`), NO pongas todo el código JavaScript dentro el tab `<script>`.
2. Crea una clase `<Nombre>View.ts` para capturar botones y manipular el DOM.
3. Crea un `<Nombre>Presenter.ts` que escuche clics de la View e invoque un `Service`.
4. En el `<script>` de `.astro`, simplemente inicializa ambas cosas e inyéctale dependencias.
