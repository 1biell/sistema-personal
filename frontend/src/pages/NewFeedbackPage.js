import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function NewFeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rating) {
      setError("Informe uma nota de 1 a 10.");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3333/feedbacks/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao registrar feedback");
      navigate(-1);
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
          <h4 className="mb-3">Novo Feedback</h4>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-sm-4">
                <label className="form-label">Nota (1 a 10) *</label>
                <input type="number" min="1" max="10" className="form-control" value={rating} onChange={(e)=>setRating(e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Comentário</label>
                <textarea className="form-control" rows={4} value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Escreva um comentário opcional" />
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

