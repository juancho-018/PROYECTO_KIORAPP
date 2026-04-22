# Seguridad — Kiora Frontend

Este documento describe el modelo de seguridad, controles de acceso y políticas de protección de datos del frontend de Kiora.

---

## 1. Control de Acceso y Roles

El sistema implementa una verificación de roles basada en el JWT:
- **Admin**: Acceso completo a gestión de usuarios, reseteo de claves, edición de inventario y exportación de reportes contables.
- **Cliente / Operador**: Acceso limitado al Punto de Venta (POS) y visualización básica. No puede modificar roles ni resetear contraseñas de terceros.

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

- **JWT (JSON Web Token)**: Almacenado en `localStorage`. Se recomienda para producción el uso de cookies `HttpOnly` para mitigar riesgos de XSS.
- **Monitoreo de Inactividad**: El `SessionManager` cierra la sesión automáticamente tras periodos prolongados de inactividad, limpiando los datos sensibles de la memoria del navegador.
- **Sanitización**: Se evita el uso de `dangerouslySetInnerHTML` para prevenir ataques de inyección de scripts.

---

## 5. PWA y Seguridad Local

- **Service Workers**: Configurados para manejar el caché de activos estáticos de forma segura.
- **Manifest**: Define una identidad única para la aplicación, evitando la suplantación de la interfaz en dispositivos móviles.

---

## 6. Recomendaciones de Despliegue

1.  **HTTPS Obligatorio**: Nunca desplegar la aplicación sobre HTTP.
2.  **CSP (Content Security Policy)**: Configurar cabeceras CSP estrictas para permitir únicamente conexiones al API Gateway y a los dominios de Stripe.
3.  **Auditoría de Roles**: Verificar periódicamente que los permisos asignados en el microservicio de usuarios coincidan con las necesidades operativas.
