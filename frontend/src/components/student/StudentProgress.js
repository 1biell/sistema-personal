import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import "../../styles/student.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StudentProgress({ id, token }) {
  const [progressList, setProgressList] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoadingProgress(true);
        const res = await fetch(`http://localhost:3333/progress/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setProgressList(data);
      } catch (err) {
        console.error("Erro ao buscar progresso:", err);
      } finally {
        setLoadingProgress(false);
      }
    };
    fetchProgress();
  }, [id, token]);

  const handleAddProgress = async () => {
    navigate(`/students/${id}/progress/new`);
    return;
    const weight = prompt("Peso (kg):");
    const chest = prompt("Tórax (cm):");
    const waist = prompt("Cintura (cm):");
    const arm = prompt("Braço (cm):");
    const leg = prompt("Pernas (cm):");
    const observation = prompt("Observação:");

    if (!weight) return;

    try {
      const res = await fetch(`http://localhost:3333/progress/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ weight, chest, waist, arm, leg, observation }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Progresso registrado com sucesso!");
        setProgressList((prev) => [data.progress, ...prev]);
      } else {
        alert(data.error || "Erro ao registrar progresso");
      }
    } catch (err) {
      alert("Erro ao registrar progresso");
      console.error(err);
    }
  };

  const chartData = {
    labels: progressList.map((p) => new Date(p.date).toLocaleDateString("pt-BR")),
    datasets: [
      { label: "Peso (kg)", data: progressList.map((p) => p.weight), borderColor: "rgb(75,192,192)", tension: 0.3 },
      { label: "Tórax (cm)", data: progressList.map((p) => p.chest), borderColor: "rgb(54,162,235)", tension: 0.3 },
      { label: "Cintura (cm)", data: progressList.map((p) => p.waist), borderColor: "rgb(255,205,86)", tension: 0.3 },
      { label: "Braço (cm)", data: progressList.map((p) => p.arm), borderColor: "rgb(255,99,132)", tension: 0.3 },
      { label: "Pernas (cm)", data: progressList.map((p) => p.leg), borderColor: "rgb(153,102,255)", tension: 0.3 },
    ],
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h5>📈 Progresso</h5>
        <button className="btn btn-outline-primary" onClick={handleAddProgress}>
          + Novo Registro
        </button>
      </div>

      {loadingProgress ? (
        <p>Carregando progresso...</p>
      ) : progressList.length === 0 ? (
        <p>Nenhum registro de progresso encontrado.</p>
      ) : (
        <>
          <div className="mt-4">
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "bottom" },
                  title: { display: true, text: "Evolução Física do Aluno" },
                },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>

          <div className="table-responsive mt-4">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Data</th>
                  <th>Peso (kg)</th>
                  <th>Tórax (cm)</th>
                  <th>Cintura (cm)</th>
                  <th>Braço (cm)</th>
                  <th>Pernas (cm)</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {progressList.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                    <td>{p.weight ?? "-"}</td>
                    <td>{p.chest ?? "-"}</td>
                    <td>{p.waist ?? "-"}</td>
                    <td>{p.arm ?? "-"}</td>
                    <td>{p.leg ?? "-"}</td>
                    <td>{p.observation || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
