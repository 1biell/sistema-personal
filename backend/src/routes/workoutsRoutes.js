import express from "express";
import {
  getWorkoutsByStudent,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from "../controllers/workoutsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requireActiveSubscription } from "../middlewares/subscriptionMiddleware.js";

const router = express.Router();

// 🔹 Rotas protegidas
router.get("/:studentId", verifyToken, requireActiveSubscription, getWorkoutsByStudent);
router.post("/:studentId", verifyToken, requireActiveSubscription, createWorkout);
router.put("/:id", verifyToken, requireActiveSubscription, updateWorkout);
router.delete("/:id", verifyToken, requireActiveSubscription, deleteWorkout);

export default router;
