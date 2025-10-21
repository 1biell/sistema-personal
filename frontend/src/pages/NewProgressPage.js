import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function NewProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    weight: "",
    chest: "",
    waist: "",
    arm: "",
    leg: "",
    observation: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.weight) {
      setError("Informe o peso (kg).");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3333/progress/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao registrar progresso");
      navigate(-1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="center-card-wrapper">
      <div className="card shadow-sm" style={{ minWidth: 560, maxWidth: 820 }}>
        <div className="card-body">
          <h4 className="mb-3">Novo Registro de Progresso</h4>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-sm-4">
                <label className="form-label">Peso (kg) *</label>
                <input type="number" step="0.1" className="form-control" value={form.weight} onChange={update("weight")} />
              </div>
              <div className="col-sm-4">
                <label className="form-label">Tórax (cm)</label>
                <input type="number" step="0.1" className="form-control" value={form.chest} onChange={update("chest")} />
              </div>
              <div className="col-sm-4">
                <label className="form-label">Cintura (cm)</label>
                <input type="number" step="0.1" className="form-control" value={form.waist} onChange={update("waist")} />
              </div>
              <div className="col-sm-4">
                <label className="form-label">Braço (cm)</label>
                <input type="number" step="0.1" className="form-control" value={form.arm} onChange={update("arm")} />
              </div>
              <div className="col-sm-4">
                <label className="form-label">Pernas (cm)</label>
                <input type="number" step="0.1" className="form-control" value={form.leg} onChange={update("leg")} />
              </div>
              <div className="col-12">
                <label className="form-label">Observação</label>
                <textarea className="form-control" rows={3} value={form.observation} onChange={update("observation")} />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancelar</button>
              <button type="submit" className="btn btn-success" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

