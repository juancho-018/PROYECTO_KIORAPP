# Seguridad — Kiora Frontend

Este documento describe el **modelo de amenazas del cliente**, límites conocidos y recomendaciones para despliegues reales en el ecosistema Kiora.

## Alcance

La aplicación es un sitio **estático (Astro `output: 'static'`)** con **React en el cliente**. La autorización definitiva reside en el **API Gateway (Puerto 3000)** y los microservicios individuales. El frontend gestiona la experiencia de usuario y oculta rutas según el rol, pero no sustituye la validación del lado del servidor.

## Token JWT y almacenamiento

- Actualmente el token se almacena en **`localStorage`** para facilitar el soporte de PWA y la persistencia entre recargas.
- **Riesgo:** El acceso por JavaScript (XSS) podría exponer el token.
- **Mitigación:** Se utiliza un cliente HTTP centralizado (`HttpClient.ts`) que adjunta automáticamente las cabeceras de autorización y maneja la expiración de forma proactiva.
- **Recomendación:** Implementar políticas de CSP estrictas en el servidor web (Nginx) para mitigar intentos de inyección.

## Integración con el API Gateway

- Todas las peticiones pasan por el **API Gateway**.
- La identidad del usuario se propaga mediante cabeceras `Authorization: Bearer <token>`.
- El frontend no almacena secretos del backend ni claves de API sensibles (Weglot es la única excepción y está limitada al dominio cliente).

## Módulo de Incidencias y Reportes

- Los reportes técnicos enviados por los usuarios son tratados como datos sensibles de operación.
- La comunicación se realiza exclusivamente por canales cifrados (HTTPS recomendado para producción).

## Transporte y Despliegue

- **HTTPS**: Es obligatorio servir tanto la aplicación como la API por canales seguros.
- **Cabeceras**: La configuración de Nginx (`nginx.conf`) incluye protecciones contra Sniffing de tipos MIME y manejo dinámico de caché para evitar que datos sensibles queden en el disco del cliente más tiempo del necesario.

## Referencias internas

- Cliente HTTP: `src/core/http/HttpClient.ts`
- Gestión de Incidencias: `src/services/IncidentService.ts`
- Autenticación: `src/services/AuthService.ts`

