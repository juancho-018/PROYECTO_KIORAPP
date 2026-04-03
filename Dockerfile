# Etapa de Servidor Web (Simplificada para usar build local)
FROM nginx:alpine

# Copiar los assets ya compilados localmente (carpeta dist)
# Esto evita errores de red al intentar descargar imágenes de build
COPY dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto estándar HTTP
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
