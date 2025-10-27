import React, { useEffect, useState } from "react";
import "../../styles/student.css";

export default function StudentFeedbacks({ id, token }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoadingFeedbacks(true);
        const res = await fetch(`http://localhost:3333/feedbacks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setFeedbacks(data);
      } catch (err) {
        console.error("Erro ao buscar feedbacks:", err);
      } finally {
        setLoadingFeedbacks(false);
      }
    };
    fetchFeedbacks();
  }, [id, token]);

  const openFeedbackForm = () => { setShowForm(true); setRating(""); setComment(""); setError(""); };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!rating) { setError("Informe uma nota de 1 a 10."); return; }
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3333/feedbacks/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao registrar feedback");
      setFeedbacks((prev) => [data.feedback, ...prev]);
      setShowForm(false);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const addReply = async (feedbackId, text, clear) => {
    if (!text || !text.trim()) return;
    try {
      const res = await fetch(`http://localhost:3333/feedbacks/${feedbackId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao comentar");
      setFeedbacks((prev) => prev.map((f) => (f.id === feedbackId ? { ...f, replies: [...(f.replies||[]), data.reply] } : f)));
      if (clear) clear("");
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <h5>Feedbacks</h5>
      {loadingFeedbacks ? (
        <p>Carregando feedbacks...</p>
      ) : feedbacks.length === 0 ? (
        <p>Nenhum feedback registrado.</p>
      ) : (
        <ul className="list-unstyled">
          {feedbacks.map((f) => (
            <li key={f.id} className="mb-3">
              <div>
                <strong>{new Date(f.date).toLocaleDateString("pt-BR")}</strong> - Nota: {f.rating ?? "N/A"}
                <br />
                <small>{f.comment || "Sem comentários"}</small>
              </div>
              {Array.isArray(f.replies) && f.replies.length > 0 && (
                <div className="mt-2" style={{ paddingLeft: 12, borderLeft: "2px solid var(--border-color)" }}>
                  {f.replies.map((r) => (
                    <div key={r.id} className="mb-1">
                      <small style={{ opacity: .85 }}>
                        <strong>{r.author?.name || 'Usuário'}</strong> ({r.author?.role}) • {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                      </small>
                      <div>{r.text}</div>
                    </div>
                  ))}
                </div>
              )}
              <ReplyBox onSubmit={(text, clear) => addReply(f.id, text, clear)} />
            </li>
          ))}
        </ul>
      )}

      <button className="btn btn-outline-primary mt-3" onClick={openFeedbackForm}>
        + Adicionar feedback
      </button>

      {showForm && (
        <div className="overlay-backdrop">
          <div className="card overlay-card">
            <button className="overlay-close" aria-label="Fechar" onClick={()=>setShowForm(false)}>×</button>
            <div className="card-body">
              <div className="overlay-title mb-3">
                <h5 className="mb-0">Novo Feedback</h5>
              </div>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <form onSubmit={submitFeedback}>
                <div className="row g-3">
                  <div className="col-sm-4">
                    <label className="form-label">Nota (1 a 10) *</label>
                    <input type="number" min="1" max="10" className="form-control" value={rating} onChange={(e)=>setRating(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Comentário</label>
                    <textarea className="form-control" rows={4} value={comment} onChange={(e)=>setComment(e.target.value)} />
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
    </div>
  );
}

function ReplyBox({ onSubmit }) {
  const [text, setText] = useState("");
  return (
    <form className="d-flex gap-2 mt-2" onSubmit={(e)=>{e.preventDefault(); onSubmit(text, setText);}}>
      <input
        className="form-control"
        placeholder="Adicionar comentário ao feedback"
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />
      <button className="btn btn-outline-primary" disabled={!text.trim()}>Comentar</button>
    </form>
  );
}

