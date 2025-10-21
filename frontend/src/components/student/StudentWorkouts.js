import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/student.css";


export default function StudentWorkouts({ id, token }) {
  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const navigate = useNavigate();

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

  const handleAddWorkout = async () => {
    navigate(`/students/${id}/workouts/new`);
    return;
    const title = prompt("Título do treino:");
    const description = prompt("Descrição do treino:");
    const dayOfWeek = prompt("Dia da semana (ex: segunda):");
    if (!title) return;

    try {
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
      alert("Treino criado com sucesso!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h5>🏋️ Treinos</h5>
        <button className="btn btn-outline-primary" onClick={handleAddWorkout}>
          + Novo Treino
        </button>
      </div>
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
