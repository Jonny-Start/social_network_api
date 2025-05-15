# Usa una imagen base de Node.js
FROM node:20

# Establece el directorio de trabajo
# WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

#globales
RUN npm install -g typescript

# Instala dependencias primero
RUN npm install

# Copia el resto del proyecto (incluyendo src/)
COPY . .

# Compila el código TypeScript a JavaScript
RUN npm run build

# Expone el puerto (ajusta si es necesario)
EXPOSE 3001

# Comando para iniciar el microservicio
CMD ["npm", "start"]
