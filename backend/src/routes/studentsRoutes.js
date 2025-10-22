// Rotas protegidas de gerenciamento de alunos
import express from "express";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById, // nova importação
} from "../controllers/studentsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requireActiveSubscription, ensureCanCreateStudent } from "../middlewares/subscriptionMiddleware.js";

const router = express.Router();

// Todas as rotas de alunos exigem token JWT
router.get("/", verifyToken, requireActiveSubscription, getStudents);
router.get("/:id", verifyToken, requireActiveSubscription, getStudentById);
router.post("/", verifyToken, requireActiveSubscription, ensureCanCreateStudent, createStudent);
router.put("/:id", verifyToken, requireActiveSubscription, updateStudent);
router.delete("/:id", verifyToken, requireActiveSubscription, deleteStudent);

export default router;
