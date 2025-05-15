import { Router } from "express";
import { login, register, validateToken } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Rutas públicas
router.post("/login", login);
router.post("/register", register);

// Rutas protegidas
router.get("/validate", authenticate, validateToken);

export default router;
