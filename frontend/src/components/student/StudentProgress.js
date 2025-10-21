import React, { useEffect, useState } from "react";
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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ weight: "", chest: "", waist: "", arm: "", leg: "", observation: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const openProgressForm = () => {
    setShowForm(true);
    setForm({ weight: "", chest: "", waist: "", arm: "", leg: "", observation: "" });
    setError("");
  };

  const submitProgress = async (e) => {
    e.preventDefault();
    if (!form.weight) { setError("Informe o peso (kg)."); return; }
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3333/progress/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao registrar progresso");
      setProgressList((prev) => [data.progress, ...prev]);
      setShowForm(false);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
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
        <h5>Progresso</h5>
        <button className="btn btn-outline-primary" onClick={openProgressForm}>
          + Novo Registro
        </button>
      </div>

      {showForm && (
        <div className="overlay-backdrop">
          <div className="card overlay-card">
            <button className="overlay-close" aria-label="Fechar" onClick={()=>setShowForm(false)}>×</button>
            <div className="card-body">
              <div className="overlay-title mb-3">
                <h5 className="mb-0">Novo Registro de Progresso</h5>
              </div>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <form onSubmit={submitProgress}>
                <div className="row g-3">
                  <div className="col-sm-4">
                    <label className="form-label">Peso (kg) *</label>
                    <input type="number" step="0.1" className="form-control" value={form.weight} onChange={(e)=>setForm({...form, weight: e.target.value})} />
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label">Tórax (cm)</label>
                    <input type="number" step="0.1" className="form-control" value={form.chest} onChange={(e)=>setForm({...form, chest: e.target.value})} />
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label">Cintura (cm)</label>
                    <input type="number" step="0.1" className="form-control" value={form.waist} onChange={(e)=>setForm({...form, waist: e.target.value})} />
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label">Braço (cm)</label>
                    <input type="number" step="0.1" className="form-control" value={form.arm} onChange={(e)=>setForm({...form, arm: e.target.value})} />
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label">Pernas (cm)</label>
                    <input type="number" step="0.1" className="form-control" value={form.leg} onChange={(e)=>setForm({...form, leg: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Observação</label>
                    <textarea className="form-control" rows={3} value={form.observation} onChange={(e)=>setForm({...form, observation: e.target.value})} />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-success" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
