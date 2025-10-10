import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  updateProfile,
  updatePassword,
  deleteAccount,
} from "../controllers/userController.js";

const router = express.Router();

// Perfil
router.put("/update-profile", verifyToken, updateProfile);

// Senha
router.put("/change-password", verifyToken, updatePassword);

// Conta
router.delete("/delete-account", verifyToken, deleteAccount);

export default router;
