import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requireActiveSubscription } from "../middlewares/subscriptionMiddleware.js";
import {
  getProgressByStudent,
  createProgress,
} from "../controllers/progressController.js";

const router = express.Router();

router.get("/:studentId", verifyToken, requireActiveSubscription, getProgressByStudent);
router.post("/:studentId", verifyToken, requireActiveSubscription, createProgress);

export default router;
