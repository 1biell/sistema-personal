import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getFeedbacksByStudent,
  createFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

router.get("/:studentId", verifyToken, getFeedbacksByStudent);
router.post("/:studentId", verifyToken, createFeedback);

export default router;
