import User from "../models/user.model";
import sequelize, { initializeDatabase } from "../config/database";

const seedUsers = async () => {
  try {
    // Inicializar base de datos
    await initializeDatabase();

    // Sincronizar el modelo con la base de datos
    await sequelize.sync({ force: true });

    console.log("Tabla de usuarios creada. Iniciando seed de usuarios...");

    // Datos de usuarios de prueba
    const users = [
      {
        firstName: "Juan",
        lastName: "Pérez",
        alias: "juanp",
        email: "juan@example.com",
        password:
          "$2a$10$1zLMnHxzlH2v2posg1o4Gu38hD9iLyp7f89y29c09NJVJm0OFPcXK",
        birthDate: new Date("1990-01-15"),
      },
      {
        firstName: "María",
        lastName: "González",
        alias: "mariag",
        email: "maria@example.com",
        password:
          "$2a$10$1zLMnHxzlH2v2posg1o4Gu38hD9iLyp7f89y29c09NJVJm0OFPcXK",
        birthDate: new Date("1992-05-22"),
      },
      {
        firstName: "Carlos",
        lastName: "Rodríguez",
        alias: "carlosr",
        email: "carlos@example.com",
        password:
          "$2a$10$1zLMnHxzlH2v2posg1o4Gu38hD9iLyp7f89y29c09NJVJm0OFPcXK",
        birthDate: new Date("1988-09-30"),
      },
      {
        firstName: "Ana",
        lastName: "Martínez",
        alias: "anam",
        email: "ana@example.com",
        password:
          "$2a$10$1zLMnHxzlH2v2posg1o4Gu38hD9iLyp7f89y29c09NJVJm0OFPcXK",
        birthDate: new Date("1995-03-10"),
      },
      {
        firstName: "Pedro",
        lastName: "López",
        alias: "pedrol",
        email: "pedro@example.com",
        password:
          "$2a$10$1zLMnHxzlH2v2posg1o4Gu38hD9iLyp7f89y29c09NJVJm0OFPcXK",
        birthDate: new Date("1985-12-05"),
      },
    ];

    // Crear usuarios en la base de datos
    await User.bulkCreate(users);

    console.log("Usuarios de prueba creados con éxito!");
  } catch (error) {
    console.error("Error al crear usuarios de prueba:", error);
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
  }
};

// Ejecutar el seeder si este archivo se ejecuta directamente
// if (require.main === module) {
seedUsers();
// }

export default seedUsers;
