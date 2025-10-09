// Middleware para verificar se o token JWT é válido
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se o header Authorization foi enviado
  if (!authHeader)
    return res.status(401).json({ error: "Token não fornecido" });

  // O header vem no formato: "Bearer TOKEN_AQUI"
  const token = authHeader.split(" ")[1];

  // Verifica e decodifica o token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token inválido" });

    // Guarda as informações do usuário dentro da requisição
    req.user = decoded;
    next();
  });
};
