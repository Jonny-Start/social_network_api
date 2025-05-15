import { Router } from "express";
import {
  getAllPosts,
  getPostById,
  createPost,
  likePost,
  getUserPosts,
} from "../controllers/posts.controller";
import { authenticate } from "./../middlewares/auth.middleware";

const router = Router();

// Todas las rutas de publicaciones requieren autenticación
router.use(authenticate);

// Rutas de publicaciones
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", createPost);
router.post("/:id/like", likePost);
router.get("/user/:userId", getUserPosts);

export default router;
