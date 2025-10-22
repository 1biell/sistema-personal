import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  ChartJS.defaults.color = theme === "dark" ? "#f8f9fa" : "#1f1f1f";
  ChartJS.defaults.borderColor = theme === "dark" ? "rgba(255,255,255,0.1)" : "#ddd";
  ChartJS.defaults.backgroundColor = "transparent";

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:3333/dashboard", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 403) {
          try {
            const dataErr = await res.json();
            if (dataErr?.code === "TRIAL_EXPIRED") {
              return navigate("/assinar", { state: { reason: "TRIAL_EXPIRED" } });
            }
            if (dataErr?.code === "CAPABILITY_DENIED") {
              return navigate("/assinar", { state: { reason: "UPGRADE_REQUIRED" } });
            }
          } catch {}
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar dados");
        setStats(data);
      } catch (err) {
        console.error("Erro ao carregar métricas:", err);
        setError("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, navigate, theme]);

  if (loading) return <p>Carregando dashboard...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!stats) return <p>Nenhum dado disponível.</p>;

  const studentsByMonth = stats.studentsByMonth || [];
  const latestStudents = stats.latestStudents || [];

  const chartData = {
    labels: studentsByMonth.map((m) => m.label),
    datasets: [
      {
        label: "Alunos cadastrados",
        data: studentsByMonth.map((m) => m.count),
        backgroundColor: theme === "dark" ? "rgba(13, 202, 240, 0.6)" : "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: theme === "dark" ? "#f8f9fa" : "#1f1f1f" },
      },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: { color: theme === "dark" ? "#f8f9fa" : "#1f1f1f", font: { size: 12 } },
        grid: { color: theme === "dark" ? "rgba(255,255,255,0.1)" : "#ddd" },
      },
      y: {
        ticks: { color: theme === "dark" ? "#f8f9fa" : "#1f1f1f", font: { size: 12 } },
        grid: { color: theme === "dark" ? "rgba(255,255,255,0.1)" : "#ddd" },
      },
    },
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Dashboard Administrativo</h3>
      <div className="row text-center mb-4">
        {[
          { label: "Alunos", value: stats.totalStudents ?? 0 },
          { label: "Treinos", value: stats.totalWorkouts ?? 0 },
          { label: "Feedbacks", value: stats.totalFeedbacks ?? 0 },
          { label: "Média de Avaliações", value: stats.avgRating ? stats.avgRating.toFixed(1) : "0.0" },
        ].map((card, i) => (
          <div key={i} className="col-md-3 mb-3">
            <div className="card p-3 shadow-sm text-center">
              <h5>{card.label}</h5>
              <h3>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-4 shadow-sm mb-4">
        <h5 className="mb-3">Crescimento de Alunos (Últimos 6 meses)</h5>
        {studentsByMonth.length > 0 ? (
          <div style={{ backgroundColor: theme === "dark" ? "#1f1f1f" : "#fff", borderRadius: 8, padding: 10, height: 350 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p>Nenhum dado de crescimento disponível.</p>
        )}
      </div>
      <div className="card p-4 shadow-sm">
        <h5 className="mb-3">Últimos Alunos Cadastrados</h5>
        {latestStudents.length > 0 ? (
          <table className="table table-sm table-bordered">
            <thead className={theme === "dark" ? "table-dark" : "table-light"}>
              <tr>
                <th>Nome</th>
                <th>Data de Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {latestStudents.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/students/${s.id}`)}>
                      Ver aluno
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhum aluno cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
