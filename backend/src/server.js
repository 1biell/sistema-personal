import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes.js";
import studentsRoutes from "./routes/studentsRoutes.js";
import workoutsRoutes from "./routes/workoutsRoutes.js";
import exercisesRoutes from "./routes/exercisesRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";


dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Rotas principais
app.use("/auth", authRoutes);
app.use("/students", studentsRoutes);
app.use("/workouts", workoutsRoutes);
app.use("/exercises", exercisesRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/progress", progressRoutes);

app.get("/", (req, res) => res.send("API do Sistema Personal 🚀"));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
