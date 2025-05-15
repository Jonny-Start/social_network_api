import Post from "../models/post.model";
import sequelize from "./../config/database";

const seedPosts = async () => {
  try {
    // Sincronizar los modelos con la base de datos
    await sequelize.sync({ force: true });

    console.log("Tablas creadas. Iniciando seed de publicaciones...");

    // Datos de publicaciones de prueba
    const posts = [
      {
        userId: 1,
        content:
          "¡Hola a todos! Este es mi primer post en esta red social. ¡Estoy emocionado de conectar con todos ustedes!",
      },
      {
        userId: 2,
        content:
          "Acabo de terminar un proyecto increíble. ¿Alguien interesado en desarrollo web por aquí?",
      },
      {
        userId: 3,
        content:
          "Compartiendo este hermoso día con amigos. La vida es mejor cuando se comparte.",
      },
      {
        userId: 4,
        content:
          "Leyendo un libro fascinante sobre inteligencia artificial. ¿Alguna recomendación de lecturas similares?",
      },
      {
        userId: 5,
        content:
          "Hoy es un buen día para aprender algo nuevo. ¿Qué están aprendiendo ustedes?",
      },
      {
        userId: 1,
        content:
          "La tecnología está cambiando el mundo. ¿Cómo creen que será el futuro en 10 años?",
      },
      {
        userId: 2,
        content:
          "¡Acabo de descubrir una nueva técnica de programación que me ha hecho más productiva!",
      },
      {
        userId: 3,
        content:
          "La música es la banda sonora de nuestras vidas. ¿Qué están escuchando hoy?",
      },
      {
        userId: 4,
        content: "A veces las mejores ideas vienen cuando menos las esperas.",
      },
      {
        userId: 5,
        content:
          "El éxito no es el final, el fracaso no es fatal: es el coraje para continuar lo que cuenta.",
      },
    ];

    // Crear publicaciones en la base de datos
    await Post.bulkCreate(posts);

    console.log("Publicaciones de prueba creadas con éxito!");
  } catch (error) {
    console.error("Error al crear publicaciones de prueba:", error);
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
  }
};

// Ejecutar el seeder si este archivo se ejecuta directamente
if (require.main === module) {
  seedPosts();
}

export default seedPosts;
