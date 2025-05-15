import { Router } from "express";
import { login, register, validateToken } from "../controllers/auth.controller";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const upload = multer();

// Rutas públicas
router.get("/login", login);
router.post("/register", upload.none(), (req, res) => {
  console.log("Datos de registro:", req.body);
  register(req, res);
});

// Rutas protegidas
router.get("/validate", authenticate, validateToken);

export default router;
