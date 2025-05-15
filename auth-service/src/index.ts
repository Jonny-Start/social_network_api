import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import authRoutes from "./routes/auth.routes";
import sequelize from "./config/database";

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/", authRoutes);

// Documentación Swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Sincronizar base de datos y levantar servidor
sequelize
  .sync()
  .then(() => {
    console.log("Conexión a la base de datos establecida con éxito.");

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servicio de autenticación escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con la base de datos:", error);
  });

export default app;
