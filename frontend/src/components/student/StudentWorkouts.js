import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/student.css";

export default function StudentWorkouts({ id, token }) {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3333/workouts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setWorkouts(data);
      } catch (e) {
        console.error("Erro ao buscar treinos", e);
      } finally {
        setLoading(false);
      }
    };
    load();
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
    if (!title.trim()) { setError("Informe um titulo para o treino."); return; }
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3333/workouts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description, dayOfWeek }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar treino");
      setWorkouts((prev) => [...prev, data.workout]);
      setShowForm(false);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return window.print();
    const styles = `<style>body{font-family:system-ui,Segoe UI,Roboto,sans-serif;padding:24px}h1{margin:0 0 8px}.muted{color:#666}.w{margin-bottom:12px}.w h3{margin:0 0 4px}hr{margin:16px 0;border:0;border-top:1px solid #ddd}</style>`;
    const listHtml = workouts.map(w=>`<div class="w"><h3>${w.title}</h3><div class="muted">${w.dayOfWeek||""}</div><div>${w.description||""}</div></div>`).join("");
    win.document.write(`<!doctype html><html><head><meta charset="utf-8">${styles}<title>Meus Treinos</title></head><body><h1>Meus Treinos</h1><hr/>${listHtml}</body></html>`);
    win.document.close(); win.focus(); win.print(); win.close();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h5>Treinos</h5>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={handlePrint}>Baixar meus treinos (PDF)</button>
          {!isStudent && (
            <button className="btn btn-outline-primary" onClick={openForm}>+ Novo Treino</button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="overlay-backdrop">
          <div className="card overlay-card">
            <button className="overlay-close" aria-label="Fechar" onClick={()=>setShowForm(false)}>×</button>
            <div className="card-body">
              <div className="overlay-title mb-3"><h5 className="mb-0">Novo Treino</h5></div>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <form onSubmit={submitWorkout}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label">Titulo *</label>
                    <input className="form-control" value={title} onChange={(e)=>setTitle(e.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Dia da semana</label>
                    <input className="form-control" value={dayOfWeek} onChange={(e)=>setDayOfWeek(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descricao</label>
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

      {loading ? (
        <p>Carregando...</p>
      ) : workouts.length === 0 ? (
        <p>Nenhum treino cadastrado.</p>
      ) : (
        <ul>
          {workouts.map((w) => (
            <li key={w.id}>
              <strong>{w.title}</strong> — {w.dayOfWeek || "Dia nao definido"}
              <br />
              <small>{w.description}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
