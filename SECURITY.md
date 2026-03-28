# Seguridad — Kiora Frontend

Este documento describe el **modelo de amenazas del cliente**, límites conocidos y recomendaciones para despliegues reales.

## Alcance

La aplicación es un sitio **estático (Astro `output: 'static'`)** con **React en el cliente**. La autorización definitiva debe estar siempre en el **backend** (API): el front solo oculta rutas y UX; **no** sustituye controles de acceso en servidor.

## Token JWT y almacenamiento

- Hoy el token se guarda en **`localStorage`** (`AuthService`), lo que lo hace accesible a cualquier script en la página.
- **Riesgo principal:** si se inyecta JavaScript malicioso (XSS), el atacante puede leer el token.
- **Mitigación recomendada (backend):** sesión con **cookies `HttpOnly` + `Secure` + `SameSite`**, con refresh en servidor; el front solo dispara login/logout y no guarda el JWT en JS.
- **Mitigación en front:** evitar `dangerouslySetInnerHTML`, sanitizar HTML si se añade contenido rico, y en despliegue configurar **Content-Security-Policy (CSP)** acorde al bundle (sin `'unsafe-inline'` salvo que sea imprescindible).

## Sesión e inactividad

- `SessionManager` cierra sesión por inactividad y avisa antes del corte; renueva el token cuando el JWT está cerca de expirar.
- Los tiempos son **orientativos en cliente**; la API debe rechazar tokens expirados o revocados.

## Variables de entorno

- `PUBLIC_API_URL`: prefijo público; no coloques secretos en variables `PUBLIC_*` de Astro.
- `PUBLIC_WEGLOT_API_KEY`: clave del widget de traducción Weglot (opcional). Si no está definida, no se carga el script de Weglot. Las claves Weglot están pensadas para uso en cliente; aun así evita compartirlas en repositorios públicos sin control.

## Transporte

- En producción, servir la app y la API solo por **HTTPS**.

## Despliegue

- Configurar cabeceras de seguridad en el proveedor (Netlify `_headers`, Vercel, nginx, etc.): al menos **CSP**, **X-Content-Type-Options**, **Referrer-Policy** y **Permissions-Policy** según necesidad.

## Referencias internas

- Cliente HTTP: `src/core/http/HttpClient.ts`
- Autenticación: `src/services/AuthService.ts`
