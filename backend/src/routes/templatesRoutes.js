import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requirePlanCapability } from "../middlewares/subscriptionMiddleware.js";
import {
  listTemplates,
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplateToStudent,
} from "../controllers/templatesController.js";

const router = express.Router();

// todas exigem plano com capability 'templates'
router.use(verifyToken, requirePlanCapability("templates"));

router.get("/", listTemplates);
router.post("/", createTemplate);
router.get("/:id", getTemplate);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);
router.post("/:id/apply", applyTemplateToStudent);

export default router;

