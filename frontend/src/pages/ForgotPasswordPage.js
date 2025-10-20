import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("http://localhost:3333/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao solicitar redefinição");
        return;
      }
      setMessage(
        "Se o e-mail existir, enviaremos um link para redefinição."
      );
    } catch (err) {
      console.error(err);
      setError("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero" aria-hidden="true" />
      <div className="login-card">
        <h3 className="login-title">Esqueceu sua senha?</h3>
        <form className="login-form" onSubmit={onSubmit}>
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
          {message && <p className="login-success">{message}</p>}
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button">Enviar link</button>
        </form>
        <div className="login-actions" style={{ marginTop: 12 }}>
          <button type="button" className="login-link" onClick={() => navigate("/login")}>Voltar ao login</button>
        </div>
      </div>
    </div>
  );
}

