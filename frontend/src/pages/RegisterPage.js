import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/LoginPage.css";
import "../styles/LoginPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3333/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
      } else {
        setSuccess("Conta criada! Faça login para começar seu teste.");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err) {
      console.error(err);
      setError("Falha de conexão com o servidor");
    } finally {
      setLoading(false);
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

        <h3 className="login-title">Criar conta</h3>
        <p className="text-muted" style={{ marginTop: -10, marginBottom: 16 }}>Você ganhará 7 dias grátis automaticamente.</p>

        <form onSubmit={handleRegister} className="login-form">
          <label className="login-label" htmlFor="name">Nome</label>
          <input id="name" className="login-input" value={name} onChange={(e) => setName(e.target.value)} required />

          <label className="login-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label className="login-label" htmlFor="phone">Telefone</label>
          <input id="phone" className="login-input" placeholder="(xx) xxxxx-xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label className="login-label" htmlFor="password">Senha</label>
          <div className="login-password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="login-input"
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
          {success && <p className="login-success" role="status">{success}</p>}

          <div className="login-actions">
            <button type="button" className="login-link" onClick={() => navigate("/login")}>
              Já possui conta? Entrar
            </button>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
