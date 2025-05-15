import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuario y generar token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionaron email y password
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });

    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        alias: user.alias,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Responder con el token y datos básicos del usuario
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        alias: user.alias,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - alias
 *               - email
 *               - password
 *               - birthDate
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               alias:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos incorrectos o incompletos
 *       409:
 *         description: Email o alias ya registrado
 *       500:
 *         description: Error del servidor
 */
export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { firstName, lastName, alias, email, password, birthDate } = req.body;

    // Validar campos obligatorios
    if (
      !firstName ||
      !lastName ||
      !alias ||
      !email ||
      !password ||
      !birthDate
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el email ya está registrado
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // Verificar si el alias ya está registrado
    const existingAlias = await User.findOne({ where: { alias } });
    if (existingAlias) {
      return res.status(409).json({ message: "El alias ya está en uso" });
    }

    // Crear nuevo usuario
    const newUser = await User.create({
      firstName,
      lastName,
      alias,
      email,
      password,
      birthDate: new Date(birthDate),
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        alias: newUser.alias,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /auth/validate:
 *   get:
 *     summary: Validar token JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido o expirado
 */
export const validateToken = async (
  req: any,
  res: Response
): Promise<Response> => {
  // Si llega aquí, el token es válido (verificado por middleware)
  return res.status(200).json({ valid: true, user: req.user });
};
