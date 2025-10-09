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

const router = express.Router();

// Todas as rotas de alunos exigem token JWT
router.get("/", verifyToken, getStudents);
router.get("/:id", verifyToken, getStudentById);
router.post("/", verifyToken, createStudent);
router.put("/:id", verifyToken, updateStudent);
router.delete("/:id", verifyToken, deleteStudent);

export default router;
