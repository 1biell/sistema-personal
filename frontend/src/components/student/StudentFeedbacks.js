import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/student.css";

export default function StudentFeedbacks({ id, token }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const navigate = useNavigate();

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

  const handleAddFeedback = async () => {
    navigate(`/students/${id}/feedback/new`);
    return;
    const rating = prompt("Nota de 1 a 10:");
    const comment = prompt("Comentário (opcional):");
    if (!rating) return;

    try {
      const res = await fetch(`http://localhost:3333/feedbacks/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Feedback registrado com sucesso!");
        setFeedbacks((prev) => [data.feedback, ...prev]);
      } else {
        alert(data.error || "Erro ao registrar feedback");
      }
    } catch (err) {
      alert("Erro ao registrar feedback");
      console.error(err);
    }
  };

  return (
    <div>
      <h5>💬 Feedbacks</h5>
      {loadingFeedbacks ? (
        <p>Carregando feedbacks...</p>
      ) : feedbacks.length === 0 ? (
        <p>Nenhum feedback registrado.</p>
      ) : (
        <ul>
          {feedbacks.map((f) => (
            <li key={f.id}>
              <strong>{new Date(f.date).toLocaleDateString()}</strong> — Nota: {f.rating ?? "N/A"}
              <br />
              <small>{f.comment || "Sem comentários"}</small>
            </li>
          ))}
        </ul>
      )}
      <button className="btn btn-outline-primary mt-3" onClick={handleAddFeedback}>
        + Adicionar feedback
      </button>
    </div>
  );
}
