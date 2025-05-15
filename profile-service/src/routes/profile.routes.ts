import { Router } from "express";
import { getProfile } from "../controllers/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Todas las rutas de perfil requieren autenticación
router.use(authenticate);

// Ruta para obtener el perfil del usuario
router.get("/profile", getProfile);
router.post("/profile", getProfile); // Añadir soporte para POST también

export default router;
