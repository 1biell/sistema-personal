import express from "express";
import {
  getExercisesByWorkout,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exercisesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação JWT
router.get("/:workoutId", verifyToken, getExercisesByWorkout);
router.post("/:workoutId", verifyToken, createExercise);
router.put("/:id", verifyToken, updateExercise);
router.delete("/:id", verifyToken, deleteExercise);

export default router;
