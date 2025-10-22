import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requirePlanCapability } from "../middlewares/subscriptionMiddleware.js";
import { requireActiveSubscription } from "../middlewares/subscriptionMiddleware.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", verifyToken, requirePlanCapability("dashboard"), getDashboardStats);

export default router;
