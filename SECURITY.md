# Seguridad — Kiora Frontend

<<<<<<< HEAD
Este documento describe el modelo de seguridad, controles de acceso y políticas de protección de datos del frontend de Kiora.
=======
Este documento describe el **modelo de amenazas del cliente**, límites conocidos y recomendaciones para despliegues reales en el ecosistema Kiora.
>>>>>>> origin/develop

---

<<<<<<< HEAD
## 1. Control de Acceso y Roles
=======
La aplicación es un sitio **estático (Astro `output: 'static'`)** con **React en el cliente**. La autorización definitiva reside en el **API Gateway (Puerto 3000)** y los microservicios individuales. El frontend gestiona la experiencia de usuario y oculta rutas según el rol, pero no sustituye la validación del lado del servidor.
>>>>>>> origin/develop

El sistema implementa una verificación de roles basada en el JWT:
- **Admin**: Acceso completo a gestión de usuarios, reseteo de claves, edición de inventario y exportación de reportes contables.
- **Cliente / Operador**: Acceso limitado al Punto de Venta (POS) y visualización básica. No puede modificar roles ni resetear contraseñas de terceros.

<<<<<<< HEAD
**Nota Crítica:** La autorización visual en el frontend es una medida de UX. El **API Gateway** y los microservicios realizan la validación definitiva de permisos en cada petición.

---

## 2. Gestión de Credenciales Administrativas

Se ha implementado un módulo de **Reseteo Administrativo de Contraseñas**:
- Solo accesible para usuarios con rol `admin`.
- Requiere una confirmación explícita mediante un diálogo de seguridad antes de proceder.
- Utiliza un endpoint dedicado (`/auth/users/:id/password`) que no requiere conocer la contraseña anterior del usuario afectado, permitiendo la recuperación de cuentas bloqueadas.

---

## 3. Integridad de Datos en Ventas

Para prevenir el fraude o errores operativos, el sistema aplica reglas de integridad:
- **Estados Inmutables**: Una vez que una venta se marca como `cancelada`, el frontend bloquea cualquier cambio posterior de estado.
- **Validación de Inventario**: El Punto de Venta (POS) impide la creación de pedidos con cantidades que excedan el stock validado por el servicio de inventario, reduciendo el riesgo de sobreventa.

---

## 4. Almacenamiento y Sesión
=======
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
>>>>>>> origin/develop

- **JWT (JSON Web Token)**: Almacenado en `localStorage`. Se recomienda para producción el uso de cookies `HttpOnly` para mitigar riesgos de XSS.
- **Monitoreo de Inactividad**: El `SessionManager` cierra la sesión automáticamente tras periodos prolongados de inactividad, limpiando los datos sensibles de la memoria del navegador.
- **Sanitización**: Se evita el uso de `dangerouslySetInnerHTML` para prevenir ataques de inyección de scripts.

<<<<<<< HEAD
---

## 5. PWA y Seguridad Local

- **Service Workers**: Configurados para manejar el caché de activos estáticos de forma segura.
- **Manifest**: Define una identidad única para la aplicación, evitando la suplantación de la interfaz en dispositivos móviles.

---

## 6. Recomendaciones de Despliegue

1.  **HTTPS Obligatorio**: Nunca desplegar la aplicación sobre HTTP.
2.  **CSP (Content Security Policy)**: Configurar cabeceras CSP estrictas para permitir únicamente conexiones al API Gateway y a los dominios de Stripe.
3.  **Auditoría de Roles**: Verificar periódicamente que los permisos asignados en el microservicio de usuarios coincidan con las necesidades operativas.
=======
- Cliente HTTP: `src/core/http/HttpClient.ts`
- Gestión de Incidencias: `src/services/IncidentService.ts`
- Autenticación: `src/services/AuthService.ts`

>>>>>>> origin/develop
