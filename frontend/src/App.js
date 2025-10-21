import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Componentes principais
import Header from "./components/layout/Header";
import StudentsPage from "./pages/StudentsPage";
import StudentDetailsPage from "./pages/StudentDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage"; // ⚙️ nova página
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import NewWorkoutPage from "./pages/NewWorkoutPage";
import NewProgressPage from "./pages/NewProgressPage";
import NewFeedbackPage from "./pages/NewFeedbackPage";

import "./styles/theme.css";

// ========================
// 🔒 ROTA PRIVADA
// ========================
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || user.role !== "admin") return <Navigate to="/students" replace />;
  return children;
}

// ========================
// 🚀 APP PRINCIPAL
// ========================
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <>
                  <Header />
                  <div className="main-content" style={{ paddingTop: "80px" }}>
                    <AdminUsersPage />
                  </div>
                </>
              </AdminRoute>
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className="main-content" style={{ paddingTop: "80px" }}>
                    <DashboardPage />
                  </div>
                </>
              </PrivateRoute>
            }
          />

          {/* Listagem de alunos */}
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className="main-content" style={{ paddingTop: "80px" }}>
                    <StudentsPage />
                  </div>
                </>
              </PrivateRoute>
            }
          />

          {/* Detalhes de um aluno */}
          <Route
            path="/students/:id"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className="main-content" style={{ paddingTop: "80px" }}>
                    <StudentDetailsPage />
                  </div>
                </>
              </PrivateRoute>
            }
          />

          {/* ⚙️ Configurações */}
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className="main-content" style={{ paddingTop: "80px" }}>
                    <SettingsPage />
                  </div>
                </>
              </PrivateRoute>
            }
          />

          {/* Redirecionamento padrão */}
          <Route
            path="/students/:id/workouts/new"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className="main-content" style={{ paddingTop: "80px" }}>
                    <NewWorkoutPage />
                  </div>
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/students/:id/progress/new"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className="main-content" style={{ paddingTop: "80px" }}>
                    <NewProgressPage />
                  </div>
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/students/:id/feedback/new"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className="main-content" style={{ paddingTop: "80px" }}>
                    <NewFeedbackPage />
                  </div>
                </>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
