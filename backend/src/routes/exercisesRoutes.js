import express from "express";
import {
  getExercisesByWorkout,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exercisesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requireActiveSubscription } from "../middlewares/subscriptionMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação JWT
router.get("/:workoutId", verifyToken, requireActiveSubscription, getExercisesByWorkout);
router.post("/:workoutId", verifyToken, requireActiveSubscription, createExercise);
router.put("/:id", verifyToken, requireActiveSubscription, updateExercise);
router.delete("/:id", verifyToken, requireActiveSubscription, deleteExercise);

export default router;
