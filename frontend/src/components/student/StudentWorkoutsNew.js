import React, { useEffect, useState } from "react";
import "../../styles/student.css";

export default function StudentWorkoutsNew({ id, token }) {
  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoadingWorkouts(true);
        const res = await fetch(`http://localhost:3333/workouts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setWorkouts(data);
      } catch (err) {
        console.error("Erro ao buscar treinos:", err);
      } finally {
        setLoadingWorkouts(false);
      }
    };
    fetchWorkouts();
  }, [id, token]);

  const openForm = () => {
    setShowForm(true);
    setTitle("");
    setDayOfWeek("");
    setDescription("");
    setError("");
  };

  const submitWorkout = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Informe um título para o treino.");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3333/workouts/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, dayOfWeek }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar treino");
      setWorkouts((prev) => [...prev, data.workout]);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h5>Treinos</h5>
        <button className="btn btn-outline-primary" onClick={openForm}>+ Novo Treino</button>
      </div>

      {showForm && (
        <div className="overlay-backdrop">
          <div className="card overlay-card">
            <button className="overlay-close" aria-label="Fechar" onClick={()=>setShowForm(false)}>×</button>
            <div className="card-body">
              <div className="overlay-title mb-3">
                <h5 className="mb-0">Novo Treino</h5>
              </div>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <form onSubmit={submitWorkout}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label">Título *</label>
                    <input className="form-control" value={title} onChange={(e)=>setTitle(e.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Dia da semana</label>
                    <input className="form-control" value={dayOfWeek} onChange={(e)=>setDayOfWeek(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descrição</label>
                    <textarea className="form-control" rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-success" disabled={saving}>{saving ? "Criando..." : "Criar"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loadingWorkouts ? (
        <p>Carregando...</p>
      ) : workouts.length === 0 ? (
        <p>Nenhum treino cadastrado.</p>
      ) : (
        <ul>
          {workouts.map((w) => (
            <li key={w.id}>
              <strong>{w.title}</strong> — {w.dayOfWeek || "Dia não definido"}
              <br />
              <small>{w.description}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
