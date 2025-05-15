import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "postgres_db",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "userDev",
  password: process.env.DB_PASSWORD || "Jonny 09",
  database: process.env.DB_NAME || "social_network_db",
  logging: false,
  retry: {
    max: 10,
    timeout: 60000,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 60000,
  },
});

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión establecida correctamente.");

    // Importar modelos
    require("../models/user.model");

    // Sincronizar modelos
    await sequelize.sync({ force: true });
    console.log("✅ Tablas creadas correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
};

export default sequelize;
