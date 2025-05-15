import { Request, Response } from "express";
import Post from "../models/post.model";
import Like from "../models/like.model";
import sequelize from "../config/database";

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Obtener todas las publicaciones
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de publicaciones
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
export const getAllPosts = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Obtener publicaciones con conteo de likes
    const { count, rows: posts } = await Post.findAndCountAll({
      include: [
        {
          model: Like,
          as: "likes",
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "userId",
        "content",
        "createdAt",
        [sequelize.fn("COUNT", sequelize.col("likes.id")), "likesCount"],
      ],
      group: ["Post.id"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      subQuery: false,
    });

    // Obtener likes del usuario actual para cada publicación
    const postsWithUserLike = await Promise.all(
      posts.map(async (post) => {
        const userLike = await Like.findOne({
          where: {
            postId: post.id,
            userId: req.user.id,
          },
        });

        return {
          ...post.toJSON(),
          likedByUser: !!userLike,
        };
      })
    );

    return res.status(200).json({
      posts: postsWithUserLike,
      totalItems: count.length,
      totalPages: Math.ceil(count.length / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Obtener una publicación por ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Publicación encontrada
 *       404:
 *         description: Publicación no encontrada
 *       500:
 *         description: Error del servidor
 */
export const getPostById = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: Like,
          as: "likes",
          attributes: ["userId"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    // Verificar si el usuario actual dio like a la publicación
    const likes = post.get("likes") as Like[];
    const likedByUser = likes.some((like) => like.userId === req.user.id);

    return res.status(200).json({
      ...post.toJSON(),
      likesCount: likes.length,
      likedByUser,
    });
  } catch (error) {
    console.error("Error al obtener publicación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Crear una nueva publicación
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Publicación creada correctamente
 *       400:
 *         description: Datos incorrectos o incompletos
 *       500:
 *         description: Error del servidor
 */
export const createPost = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res
        .status(400)
        .json({ message: "El contenido de la publicación es obligatorio" });
    }

    const newPost = await Post.create({
      userId,
      content,
    });

    return res.status(201).json({
      message: "Publicación creada correctamente",
      post: {
        id: newPost.id,
        userId: newPost.userId,
        content: newPost.content,
        createdAt: newPost.createdAt,
        likesCount: 0,
        likedByUser: false,
      },
    });
  } catch (error) {
    console.error("Error al crear publicación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Dar like a una publicación
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Like agregado o eliminado correctamente
 *       404:
 *         description: Publicación no encontrada
 *       500:
 *         description: Error del servidor
 */
export const likePost = async (req: any, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar si la publicación existe
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    // Verificar si el usuario ya dio like a la publicación
    const existingLike = await Like.findOne({
      where: {
        postId: id,
        userId,
      },
    });

    if (existingLike) {
      // Si ya existe un like, lo eliminamos (toggle)
      await existingLike.destroy();
      return res.status(200).json({ message: "Like eliminado correctamente" });
    } else {
      // Si no existe, creamos uno nuevo
      await Like.create({
        postId: parseInt(id),
        userId,
      });
      return res.status(200).json({ message: "Like agregado correctamente" });
    }
  } catch (error) {
    console.error("Error al dar/quitar like:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Obtener publicaciones de un usuario específico
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de publicaciones del usuario
 *       500:
 *         description: Error del servidor
 */
export const getUserPosts = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Post.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Like,
          as: "likes",
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "userId",
        "content",
        "createdAt",
        [sequelize.fn("COUNT", sequelize.col("likes.id")), "likesCount"],
      ],
      group: ["Post.id"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      subQuery: false,
    });

    // Obtener likes del usuario actual para cada publicación
    const postsWithUserLike = await Promise.all(
      posts.map(async (post) => {
        const userLike = await Like.findOne({
          where: {
            postId: post.id,
            userId: req.user.id,
          },
        });

        return {
          ...post.toJSON(),
          likedByUser: !!userLike,
        };
      })
    );

    return res.status(200).json({
      posts: postsWithUserLike,
      totalItems: count.length,
      totalPages: Math.ceil(count.length / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error al obtener publicaciones del usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
