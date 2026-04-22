# Kiora - Frontend Workspace (Professional Edition)

**Kiora** es el ecosistema frontend centralizado para la gestión integral del sistema de microservicios. Esta aplicación integra los módulos de **Administración**, **Inventario**, **Venta Directa (Kiosk)**, **Incidencias** y **Seguridad** bajo una arquitectura robusta de **Astro v5** y **React v19**.

---

## 📂 Arquitectura Global del Proyecto

La estructura ha sido diseñada para escalar horizontalmente mediante módulos independientes:

```text
src/
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
```

---

## 🛠️ Documentación Detallada

Para una explicación profunda de la arquitectura y patrones utilizados, consulta:
👉 **[Guía de Código (src/README.md)](./src/README.md)**  
👉 **[TECHNICAL_DOCS.md](./src/TECHNICAL_DOCS.md)**  
👉 **[Seguridad y Modelos de Amenaza](./SECURITY.md)**

---

## 🚀 Guía de Inicio Rápido

### Desarrollo Local
1. **Instalar dependencias:** `npm install`
2. **Configurar entorno:** `cp .env.example .env` (Verifica `PUBLIC_API_URL` apuntando al Gateway en puerto 3000)
3. **Ejecutar:** `npm run dev`
   - La aplicación corre por defecto en: **`http://localhost:8080`**

### Despliegue con Docker
```bash
# Construir y levantar todo el ecosistema front (Puerto 8080 expuesto)
docker-compose up -d --build
```

---

## 📐 Principios de Ingeniería

- **Clean Architecture**: Separación estricta entre UI e Infraestructura.
- **Microservices Oriented**: Comunicación optimizada a través de un API Gateway.
- **PWA (Progressive Web App)**: Soporte nativo para instalación y funcionamiento offline.
- **Premium UI**: Diseño consistente basado en tokens de marca (Kiora Red).

---

## 📝 Soporte y Troubleshooting

- **API**: Asegúrate de que el Gateway de microservicios (Puerto 3000) esté levantado para que el frontend funcione correctamente.
- **Incidencias**: Usa el módulo de Soporte para reportar fallos técnicos detectados en tiempo real.
- **Recibos**: Los PDFs de ventas se generan dinámicamente conectando con el `reports-service`.
