import express from "express";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";
import { listUsers, getUser, createPersonal, updateUser } from "../controllers/adminController.js";
import { deleteUser } from "../controllers/adminController.js";

const router = express.Router();

// Todas as rotas abaixo exigem admin
router.use(verifyToken, requireAdmin);

router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.post("/users", createPersonal); // cria personal
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;

