import express from "express";
import {
  getWorkoutsByStudent,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from "../controllers/workoutsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔹 Rotas protegidas
router.get("/:studentId", verifyToken, getWorkoutsByStudent);
router.post("/:studentId", verifyToken, createWorkout);
router.put("/:id", verifyToken, updateWorkout);
router.delete("/:id", verifyToken, deleteWorkout);

export default router;
