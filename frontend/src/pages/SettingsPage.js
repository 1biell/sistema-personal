import React, { useState } from "react";
import "../styles/SettingsPage.css";
import { useTheme } from "../context/ThemeContext"; // ✅ Importa o contexto do tema

export default function SettingsPage() {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "Personal Trainer",
    email: "seuemail@exemplo.com",
  };

  const { theme, toggleTheme } = useTheme(); // ✅ Usa o contexto
  const [user, setUser] = useState(storedUser);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // === Editar perfil ===
  const handleEditProfile = async () => {
    const name = prompt("Novo nome:", user.name);
    const email = prompt("Novo e-mail:", user.email);
    if (!name || !email) return;

    try {
      const res = await fetch("http://localhost:3333/users/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("✅ Perfil atualizado com sucesso!");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (err) {
      alert("❌ Erro ao atualizar perfil");
    }
  };

  // === Trocar Senha ===
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar senha");

      alert("✅ Senha alterada com sucesso!");
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Alterar plano ===
  const handleChangePlan = () => {
    alert(
      "📦 Planos disponíveis:\n\n" +
        "Básico — R$49/mês (até 5 alunos)\n" +
        "Avançado — R$99/mês (até 30 alunos)\n" +
        "Premium — R$149/mês (ilimitado)\n\n" +
        "💳 Em breve: sistema de pagamentos integrado!"
    );
  };

  // === Excluir conta ===
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação é irreversível."
      )
    )
      return;

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

  // === Sair ===
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="container mt-4">
      <h4>⚙️ Configurações</h4>

      {/* PERFIL */}
      <div className="card mt-3">
        <div className="card-body">
          <h5>👤 Perfil</h5>
          <p>
            <strong>Nome:</strong> {user.name}
            <br />
            <strong>Email:</strong> {user.email}
          </p>
          <button className="btn btn-outline-primary me-2" onClick={handleEditProfile}>
            Editar Perfil
          </button>
          <button
            className="btn btn-outline-warning"
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            Trocar Senha
          </button>

          {showChangePassword && (
            <div className="mt-4 border-top pt-3">
              <h6>🔒 Alterar Senha</h6>
              <form onSubmit={handleChangePassword}>
                <div className="mb-2">
                  <label className="form-label">Senha Atual</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Nova Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-success w-100" disabled={loading}>
                  {loading ? "Salvando..." : "Alterar Senha"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* PREFERÊNCIAS */}
      <div className="card mt-3">
        <div className="card-body">
          <h5>🌸 Preferências do Sistema</h5>
          <div className="form-check form-switch mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="darkModeSwitch"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
            <label className="form-check-label" htmlFor="darkModeSwitch">
              Tema Escuro
            </label>
          </div>
          <div className="form-check form-switch mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
              id="emailNotificationsSwitch"
            />
            <label className="form-check-label" htmlFor="emailNotificationsSwitch">
              Notificações por e-mail
            </label>
          </div>
        </div>
      </div>

      {/* CONTA */}
      <div className="card mt-3 mb-5">
        <div className="card-body">
          <h5>💼 Conta</h5>
          <p>
            <strong>Plano Atual:</strong> Premium
            <br />
            <small>Renovação em: 09/11/2025</small>
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-secondary" onClick={handleChangePlan}>
              Alterar Plano
            </button>
            <button className="btn btn-outline-danger" onClick={handleDeleteAccount}>
              Excluir Conta
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
