# Usa la imagen base de Node.js
FROM node:20

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto
COPY package*.json ./
RUN npm run build && npm install

COPY . .

# Expone el puerto
EXPOSE 3003

# Comando para iniciar el microservicio
CMD ["npm", "start"]
