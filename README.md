# Kiora - Frontend Panel (Enterprise Edition)

**Kiora** es el panel de control central para la gestión de sistema de microservicios para el kiosko inteligente Kiora. Esta aplicación ha sido diseñada bajo estándares de ingeniería de software de alto nivel, utilizando **Astro v5**, **React v19**, y **Tailwind CSS v4**.

La arquitectura no es solo funcional; es una declaración de principios. Implementamos de forma estricta los principios de **Arquitectura Limpia (Clean Architecture)** y **Principios SOLID** para garantizar que el código sea un activo de larga duración, no una deuda técnica.

---

## Arquitectura del proyecto

```text
src/
├── components/             # Componentes de UI (React)
│   ├── cargando.jsx        # Overlay de carga reutilizable (con props)
│   └── icono.jsx           # Favicon y recursos visuales base
├── core/                   # Abstracciones de infraestructura (DIP)
│   ├── http/
│   │   └── HttpClient.ts   # Cliente base para peticiones Fetch (Generic)
│   └── ui/
│       └── AlertService.ts # Servicio de notificaciones (SweetAlert2)
├── services/               # Lógica de negocio y Casos de Uso (SRP)
│   ├── AuthService.ts      # Autenticación, Login y manejo de JWT
│   ├── SessionManager.ts   # Control de inactividad (15m) y expiración
│   └── UserService.ts      # Gestión de datos de usuarios y desbloqueos
├── views/                  # Patrón MVP (Model-View-Presenter)
│   └── panel/
│       ├── PanelPresenter.ts # Orquestador de lógica (Sin interactuar con DOM)
│       └── PanelView.ts      # Manipulación directa del DOM y eventos
├── pages/                  # Rutas de Astro e Inicialización de MVP
│   ├── index.astro         # Router de entrada (Redirección a login)
│   ├── login.astro         # Vista de Login e inyección de dependencias
│   ├── panel.astro         # Dashboard principal y gestión de usuarios
│   └── recuperarContraseña.astro # Flujo de recuperación de credenciales
├── styles/
│   └── global.css          # Estilos base y configuración de Tailwind v4
└── assets/                 # Assets procesados por Astro durante el build
```

### Capas de la Aplicación

- **`src/core/`**: Abstracciones base. Aquí vive la infraestructura que se comunica con el "mundo exterior" (APIs, Alertas).
- **`src/services/`**: La inteligencia del sistema. Las reglas de negocio (Login, Gestión de Sesión, Validaciones) se definen aquí de forma agnóstica al framework.
- **`src/views/`**: El contrato visual. Los `Presenters` coordinan, las `Views` ejecutan la manipulación del DOM. **Prohibido poner `fetch` aquí.**
- **`src/pages/`**: Solo inicialización. Son el pegamento que une las piezas de MVP cuando el usuario entra en una ruta.
- **`src/components/`**: Componentes de React puros. UI de alta calidad sin lógica pesada.

---

## Docker & Despliegue de Producción

El despliegue está automatizado mediante un **Multistage Dockerfile** que garantiza una imagen final mínima y segura.

### Requisitos
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Comandos Rápidos

```bash
# 1. Preparar variables (Asegúrate de editar .env antes)
cp .env.example .env

# 2. Levantar en producción (Usa el puerto 3000 por defecto)
docker-compose up -d --build

# 3. Detener los servicios
docker-compose down
```

> [!IMPORTANT]
> Astro hornea las variables `PUBLIC_` durante el tiempo de **build**. Por eso, el `docker-compose.yml` pasa la `PUBLIC_API_URL` como un `build-arg` al `Dockerfile`. Si cambias la URL de la API, necesitas hacer un `--build`.

---

## 🛠️ Guía de Desarrollo Local

Si prefieres trabajar fuera de un contenedor:

1. **Instalación:** `npm install`
2. **Ejecución:** `npm run dev` (Accede en `http://localhost:4321`)
3. **Build local:** `npm run build` (Genera la carpeta `dist/`)

### Reglas de Oro para Desarrolladores

1. **No Logic in Scripts:** El tag `<script>` en los archivos `.astro` debe tener máximo 10-15 líneas. Solo debe servir para instanciar clases e inicializarlas.
2. **SOLID for life:** Si una función hace más de una cosa, divídela. Si un archivo tiene más de 300 líneas, analízalo.
3. **Typography & UI:** Usamos **Inter** como tipografía principal. Mantén la consistencia visual usando los tokens de Tailwind definidos en el proyecto.

---

## 📝 Troubleshooting

- **¿El backend me da 401/403?:** Verifica que `SessionManager.ts` esté enviando correctamente el token desde el `localStorage`.
- **¿Nginx no carga las rutas secundarias?:** El archivo `nginx.conf` ya está configurado para manejar el ruteo de Astro (SPA-like) mediante `try_files`. No lo modifiques a menos que sepas qué haces.
- **¿Variables de entorno vacías?:** Asegúrate de reiniciar el servidor de Astro (`npm run dev`) cada vez que toques el archivo `.env`.

---
