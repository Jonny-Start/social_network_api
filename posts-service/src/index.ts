import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import postsRoutes from "./routes/posts.routes";
import sequelize from "./config/database";

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/", postsRoutes);

// Documentación Swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Sincronizar base de datos y levantar servidor
sequelize
  .sync()
  .then(() => {
    console.log("Conexión a la base de datos establecida con éxito.");

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servicio de publicaciones escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Error al conectar con la base de datos:", error);
  });

export default app;
