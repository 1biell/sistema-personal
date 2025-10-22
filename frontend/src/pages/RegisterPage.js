import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
          <input id="password" type="password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} required />

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
