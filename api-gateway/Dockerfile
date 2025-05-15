FROM node:18-alpine

WORKDIR /app

# Instalar dependencias necesarias
RUN apk add --no-cache bash curl

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Verificar la estructura de directorios
RUN echo "Contenido del directorio después de compilar:" && \
    ls -la && \
    echo "Contenido de dist:" && \
    ls -la dist/ || echo "Error: dist directory doesn't exist"

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación usando el archivo compilado
CMD ["npm", "start"]