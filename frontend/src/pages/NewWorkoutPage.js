import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function NewWorkoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
      navigate(-1); // volta para a página anterior
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="center-card-wrapper">
      <div className="card shadow-sm" style={{ minWidth: 560, maxWidth: 720 }}>
        <div className="card-body">
          <h4 className="mb-3">Novo Treino</h4>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label">Título do treino *</label>
                <input className="form-control" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ex: ABC Peito/Costas" />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Dia da semana</label>
                <input className="form-control" value={dayOfWeek} onChange={(e)=>setDayOfWeek(e.target.value)} placeholder="Ex: segunda" />
              </div>
              <div className="col-12">
                <label className="form-label">Descrição</label>
                <textarea className="form-control" rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Detalhes do treino, exercícios, etc." />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancelar</button>
              <button type="submit" className="btn btn-success" disabled={saving}>{saving ? "Criando..." : "Criar Treino"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

