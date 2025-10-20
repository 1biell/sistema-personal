import React from "react";
import "./Header.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; // 👈 Importa o tema

export default function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme } = useTheme(); // 👈 Usa o tema atual

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair da conta?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <header
      className="gnt-header"
      style={{
        backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
        borderBottom: `1px solid ${theme === "dark" ? "#333" : "#ddd"}`,
        color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
        transition: "all 0.3s ease",
      }}
    >
      <div className="gnt-header-container">
        <div
          className="gnt-logo-area"
          onClick={() => navigate("/students")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <img src={logo} alt="GNT Tech" className="gnt-logo" />
          <h2
            className="gnt-title"
            style={{
              color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
              marginLeft: "8px",
            }}
          >
            GNT Tech
          </h2>
        </div>

        <nav className="gnt-nav" style={{ display: "flex", gap: "15px" }}>
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin/users")}
              style={{
                background: "transparent",
                border: "none",
                color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Admin
            </button>
          )}
          <button
            onClick={() => navigate("/students")}
            style={{
              background: "transparent",
              border: "none",
              color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
              fontWeight: "500",
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
          >
            👥 Alunos
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "transparent",
              border: "none",
              color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => navigate("/settings")}
            style={{
              background: "transparent",
              border: "none",
              color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            ⚙️ Configurações
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "none",
              color: theme === "dark" ? "#ff6b6b" : "#dc3545",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🚪 Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
