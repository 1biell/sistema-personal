import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LoginPage.css";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3333/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciais inválidas");
        return;
      }

      // 🧠 Agora salvamos token e usuário no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🧩 Atualiza o contexto global
      login(data.token, data.user);

      // ✅ Redireciona para o painel
      navigate("/students");
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar ao servidor");
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero" aria-hidden="true" />
      <div className="login-card">
        <div className="login-brand">
          <img src={logo} alt="Logo" className="login-logo" />
          <h2>Sistema Personal</h2>
        </div>

        <h3 className="login-title">Login</h3>

        <form onSubmit={handleLogin} className="login-form">
          <label className="login-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="login-input"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="login-label" htmlFor="password">Senha</label>
          <div className="login-password-wrapper">
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <div className="login-actions">
            <button
              type="button"
              className="login-link"
              onClick={() => navigate("/forgot-password")}
            >
              Esqueceu a senha?
            </button>
          </div>

          <button type="submit" className="login-button">Entrar</button>
        </form>
      </div>
    </div>
  );
}
