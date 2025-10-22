import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requireActiveSubscription } from "../middlewares/subscriptionMiddleware.js";
import {
  getFeedbacksByStudent,
  createFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

router.get("/:studentId", verifyToken, requireActiveSubscription, getFeedbacksByStudent);
router.post("/:studentId", verifyToken, requireActiveSubscription, createFeedback);

export default router;
