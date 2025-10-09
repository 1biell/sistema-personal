import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getProgressByStudent,
  createProgress,
} from "../controllers/progressController.js";

const router = express.Router();

router.get("/:studentId", verifyToken, getProgressByStudent);
router.post("/:studentId", verifyToken, createProgress);

export default router;
