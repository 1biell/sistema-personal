import React from "react";
import "./Header.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const goHome = () => {
    if (user?.role === "student" && user?.studentId) navigate(`/students/${user.studentId}`);
    else navigate("/students");
  };

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair da conta?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <header className="gnt-header">
      <div className="gnt-header-container">
        <div
          className="gnt-logo-area"
          onClick={goHome}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <img src={logo} alt="Logo" className="gnt-logo" />
          <h2 className="gnt-title" style={{ color: theme === "dark" ? "#f8f9fa" : "#1f1f1f", marginLeft: 8 }}>Sistema Personal</h2>
        </div>

        <nav className="gnt-nav" style={{ display: "flex", gap: 15 }}>
          {user?.role === "admin" && (
            <button onClick={() => navigate("/admin/users")} style={navBtnStyle(theme, 600)}>
              Admin
            </button>
          )}

          {user?.role !== "student" && (
            <button onClick={() => navigate("/students")} style={navBtnStyle(theme)}>
              Alunos
            </button>
          )}

          {user?.role !== "student" && (
            <button onClick={() => navigate("/templates")} style={navBtnStyle(theme)}>
              Modelos
            </button>
          )}

          {user?.role !== "student" && (
            <button onClick={() => navigate("/dashboard")} style={navBtnStyle(theme)}>
              Dashboard
            </button>
          )}

          <button onClick={() => navigate("/settings")} style={navBtnStyle(theme)}>Configurações</button>

          <button
            aria-label="Alternar tema"
            title={theme === "dark" ? "Tema: Escuro" : "Tema: Claro"}
            onClick={toggleTheme}
            className="theme-toggle"
          >
            {theme === "dark" ? "☾" : "☀"}
          </button>

          <button onClick={handleLogout} style={{...navBtnStyle(theme,600), color: theme === "dark" ? "#ff6b6b" : "#dc3545"}}>
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}

function navBtnStyle(theme, weight = 500) {
  return {
    background: "transparent",
    border: "none",
    color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
    fontWeight: weight,
    cursor: "pointer",
    transition: "color 0.2s ease",
  };
}
