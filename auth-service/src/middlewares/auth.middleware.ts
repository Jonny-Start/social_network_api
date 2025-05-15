import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "3n3r4d0r3s3rv1c10";

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Token de autenticación no proporcionado" });
    }

    // Verificar formato del token (Bearer <token>)
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Formato de token inválido" });
    }

    const token = parts[1];

    // Verificar y decodificar el token
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expirado" });
        }
        return res.status(401).json({ message: "Token inválido" });
      }

      // Guardar el usuario decodificado en la request para uso posterior
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
