import React, { useEffect, useState } from "react";
import "../styles/SettingsPage.css";
import SectionHeader from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}") || {
    name: "Personal Trainer",
    email: "seuemail@exemplo.com",
  };

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [user, setUser] = useState(storedUser);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState({ plan: null, dueDate: null, active: false, remainingDays: 0, studentLimit: null });
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState("");

  const fetchSubscription = async () => {
    setSubError("");
    setSubLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sem token");
      const res = await fetch("http://localhost:3333/users/subscription", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao carregar assinatura");
      setSubscription(data);
    } catch (err) {
      console.error("Erro assinatura:", err);
      setSubError(err.message || "Erro ao carregar assinatura");
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => { fetchSubscription(); }, []);

  const handleEditProfile = async () => {
    const name = prompt("Novo nome:", user.name || "");
    const email = prompt("Novo e-mail:", user.email || "");
    if (!name || !email) return;
    try {
      const res = await fetch("http://localhost:3333/users/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar perfil");
      alert("Perfil atualizado com sucesso!");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (err) {
      alert("Erro ao atualizar perfil");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3333/users/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar senha");
      alert("Senha alterada com sucesso!");
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = () => navigate("/assinar");

  const handleDeleteAccount = async () => {
    if (!window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) return;
    try {
      const res = await fetch("http://localhost:3333/users/delete-account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        alert("Conta excluída com sucesso!");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert("Erro ao excluir conta");
      }
    } catch (err) {
      alert("Erro ao excluir conta");
    }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  const formatPlan = (code) => {
    if (!code) return "Sem plano";
    const map = { basico: "Básico", avancado: "Avançado", ilimitado: "Ilimitado", trial: "Teste Grátis" };
    return map[code] || code;
  };

  const formatDate = (d) => {
    try { const dt = new Date(d); if (isNaN(dt)) return "Data inválida"; return dt.toLocaleDateString("pt-BR"); }
    catch { return String(d); }
  };

  return (
    <div className="container mt-4">
      <SectionHeader title="Configurações" />

      <div className="card mt-3">
        <div className="card-body">
          <h5>Perfil</h5>
          <p>
            <strong>Nome:</strong> {user.name}
            <br />
            <strong>Email:</strong> {user.email}
          </p>
          <button className="btn btn-outline-primary me-2" onClick={handleEditProfile}>Editar Perfil</button>
          <button className="btn btn-outline-warning" onClick={() => setShowChangePassword(!showChangePassword)}>Trocar Senha</button>

          {showChangePassword && (
            <div className="mt-4 border-top pt-3">
              <h6>Alterar Senha</h6>
              <form onSubmit={handleChangePassword}>
                <div className="mb-2">
                  <label className="form-label">Senha Atual</label>
                  <input type="password" className="form-control" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Nova Senha</label>
                  <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar Nova Senha</label>
                  <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={loading}>{loading ? "Salvando..." : "Alterar Senha"}</button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <h5>Preferências do Sistema</h5>
          <div className="form-check form-switch mt-2">
            <input className="form-check-input" type="checkbox" id="darkModeSwitch" checked={theme === "dark"} onChange={toggleTheme} />
            <label className="form-check-label" htmlFor="darkModeSwitch">Tema Escuro</label>
          </div>
          <div className="form-check form-switch mt-2">
            <input className="form-check-input" type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} id="emailNotificationsSwitch" />
            <label className="form-check-label" htmlFor="emailNotificationsSwitch">Notificações por e-mail</label>
          </div>
        </div>
      </div>

      <div className="card mt-3 mb-5">
        <div className="card-body">
          <h5>Conta</h5>
          <p className="mb-2">
            <strong>Plano Atual:</strong> {formatPlan(subscription?.plan)}
            <br />
            <small>
              {subscription?.dueDate ? `Vencimento: ${formatDate(subscription.dueDate)}` : "Sem vencimento definido"}
              {subscription?.plan === "trial" && subscription?.remainingDays >= 0 ? ` • ${subscription.remainingDays} dias restantes` : ""}
            </small>
          </p>
          {subLoading && <p className="text-muted">Atualizando assinatura...</p>}
          {subError && <p className="text-danger">{subError}</p>}
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-secondary" onClick={handleChangePlan}>Alternar Plano</button>
            <button className="btn btn-outline-primary" onClick={fetchSubscription} disabled={subLoading}>Recarregar assinatura</button>
            <button className="btn btn-outline-danger" onClick={handleDeleteAccount}>Excluir Conta</button>
            <button className="btn btn-danger" onClick={handleLogout}>Sair da Conta</button>
          </div>
        </div>
      </div>
    </div>
  );
}

