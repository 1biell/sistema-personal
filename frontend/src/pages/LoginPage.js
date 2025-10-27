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
  const [showPassword, setShowPassword] = useState(false);
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
      if (!res.ok && res.status === 403 && (data?.code === "TRIAL_EXPIRED")) {
        navigate("/assinar", { state: { reason: "TRIAL_EXPIRED" } });
        return;
      }

      if (!res.ok) {
        setError(data.error || "Credenciais inválidas");
        return;
      }

      // 🧠 Agora salvamos token e usuário no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Atualiza o contexto global
      login(data.token, data.user);

      // ✅ Redireciona para o painel
      if (data.user?.role === "admin") { navigate("/admin/users"); } else if (data.user?.role === "student" && data.user?.studentId) { navigate(`/students/${data.user.studentId}`); } else { navigate("/students"); }
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
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/>
                  <circle cx="12" cy="12" r="3"/>
                  <line x1="3" y1="3" x2="21" y2="21"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
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
            <button
              type="button"
              className="login-link"
              onClick={() => navigate("/register")}
            >
              Não possui conta? Crie uma agora
            </button>
          </div>

          <button type="submit" className="login-button">Entrar</button>

          <div className="login-signup">
            <span>Não possui conta? </span>
            <button
              type="button"
              className="login-signup-link"
              onClick={() => navigate("/register")}
            >
              Criar conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


