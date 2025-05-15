import { Request, Response } from "express";
import User from "../models/user.model";

export const getProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener el ID del usuario del token JWT que fue decodificado en el middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Excluir la contraseña de la respuesta
    const { password, ...userWithoutPassword } = user.toJSON();

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
