# Dockerfile
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Instalar dependencias primero (para aprovechar caché)
COPY package*.json ./
RUN npm ci --only=production

# Copiar archivos del proyecto
COPY . .

# Exponer puerto
EXPOSE 3002

# Comando para iniciar
CMD ["node", "server.js"]