import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  // O formato esperado é: "Bearer TOKEN"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token ausente" });
  }

  try {
    // Verifica o token com o segredo do .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adiciona o usuário decodificado ao req
    req.user = decoded;

    next(); // segue para o controller
  } catch (error) {
    console.error("Erro ao verificar token:", error.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};
