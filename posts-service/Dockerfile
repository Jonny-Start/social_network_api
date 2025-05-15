FROM node:18-alpine

WORKDIR /app

# Copiar archivos de package.json primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Si tienes un paso de compilación (TypeScript a JavaScript)
RUN npm run build

# Exponer el puerto que usa la aplicación
EXPOSE 3002

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]