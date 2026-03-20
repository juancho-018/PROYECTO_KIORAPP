# Kiora - Frontend Workspace (Professional Edition)

**Kiora** es el ecosistema frontend centralizado para la gestión del sistema de microservicios. Esta aplicación integra los módulos de **Administración**, **Autenticación**, **Seguridad** y **Soporte** bajo una arquitectura robusta de **Astro v5** y **React v19**.

---

## 📂 Arquitectura Global del Proyecto

La estructura ha sido diseñada para escalar horizontalmente mediante módulos independientes:

```text
src/
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
```

---

## 🛠️ Documentación Detallada

Para una explicación profunda de la arquitectura y patrones utilizados, consulta:
👉 **[TECHNICAL_DOCS.md](./src/TECHNICAL_DOCS.md)**

---

## 🚀 Guía de Inicio Rápido

### Desarrollo Local
1. **Instalar dependencias:** `npm install`
2. **Configurar entorno:** `cp .env.example .env`
3. **Ejecutar:** `npm run dev`

### Despliegue con Docker
```bash
# Construir y levantar todo el ecosistema front
docker-compose up -d --build
```

---

## 📐 Principios de Ingeniería

- **Clean Architecture**: Separación estricta entre UI e Infraestructura.
- **SOLID**: Código mantenible, extensible y testeable.
- **Performance**: Hidratación selectiva de componentes React mediante Astro.
- **Premium UI**: Diseño consistente basado en tokens de marca (Kiora Red).

---

## 📝 Soporte y Troubleshooting

- **Logs de Build**: Revisa `build.log` o `tsc.log` para errores de compilación o tipos.
- **Sesiones**: Si experimentas desconexiones inesperadas, verifica la configuración de `SessionManager.ts`.
- **API**: Asegúrate de que `PUBLIC_API_URL` en tu `.env` apunte al backend correcto.
