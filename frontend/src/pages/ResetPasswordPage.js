import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/LoginPage.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
  const query = useQuery();
  const token = query.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!token) {
      setError("Token inválido na URL");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem");
      return;
    }
    try {
      const res = await fetch("http://localhost:3333/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao redefinir senha");
        return;
      }
      setMessage("Senha redefinida com sucesso. Redirecionando...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error(err);
      setError("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero" aria-hidden="true" />
      <div className="login-card">
        <h3 className="login-title">Defina sua nova senha</h3>
        <form className="login-form" onSubmit={onSubmit}>
          <label className="login-label" htmlFor="password">Nova senha</label>
          <input
            id="password"
            type="password"
            className="login-input"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="login-label" htmlFor="confirm">Confirmar nova senha</label>
          <input
            id="confirm"
            type="password"
            className="login-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {message && <p className="login-success">{message}</p>}
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button">Redefinir senha</button>
        </form>
        <div className="login-actions" style={{ marginTop: 12 }}>
          <button type="button" className="login-link" onClick={() => navigate("/login")}>Voltar ao login</button>
        </div>
      </div>
    </div>
  );
}

