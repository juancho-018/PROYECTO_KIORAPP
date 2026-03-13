# Etapa 1: Construcción (Build) usando Node.js
FROM node:20-alpine AS build

# Desactivar la telemetría de Astro por privacidad y velocidad
ENV ASTRO_TELEMETRY_DISABLED=1

WORKDIR /app

# Copiar configuración de paquetes
COPY package.json package-lock.json* ./

# Instalación limpia limitando dependencias innecesarias de desarrollo al final
RUN npm ci

# Copiar todo el código base (excepto lo bloqueado en .dockerignore)
COPY . .

# Ejecutar el build estático de Astro (Genera archivos en /app/dist)
RUN npm run build

# Etapa 2: Servidor Web de Producción (Nginx)
FROM nginx:alpine

# Copiar los assets generados de la Etapa 1 a la carpeta public de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto estándar HTTP
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
