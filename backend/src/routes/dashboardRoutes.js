import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", verifyToken, getDashboardStats);

export default router;
