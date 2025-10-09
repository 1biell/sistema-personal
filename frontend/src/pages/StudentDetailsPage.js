import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function StudentDetailsPage() {
  const { id } = useParams(); // ID do aluno
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  // --- Treinos ---
  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // --- Exercícios ---
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    series: "",
    repetitions: "",
    load: "",
    restTime: "",
    notes: "",
  });

  // --- Feedbacks ---
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // --- Progresso ---
  const [progressList, setProgressList] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // ============= BUSCAR ALUNO =============
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`http://localhost:3333/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setStudent(data);
        else setError(data?.error || "Erro ao carregar informações do aluno");
      } catch {
        setError("Erro ao carregar informações do aluno");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, token]);

  // ============= BUSCAR TREINOS =============
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

  // ============= BUSCAR FEEDBACKS =============
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

  // ============= BUSCAR PROGRESSO =============
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

  // ============= CRIAR TREINO =============
  const handleAddWorkout = async () => {
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

  // ============= CRIAR FEEDBACK =============
  const handleAddFeedback = async () => {
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

  // ============= CRIAR PROGRESSO =============
  const handleAddProgress = async () => {
    const weight = prompt("Peso (kg):");
    const chest = prompt("Tórax (cm):");
    const waist = prompt("Cintura (cm):");
    const arms = prompt("Braço (cm):");
    const legs = prompt("Pernas (cm):");
    const observation = prompt("Observação:");

    if (!weight) return;

    try {
      const res = await fetch(`http://localhost:3333/progress/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weight,
          chest,
          waist,
          arms,
          legs,
          observation,
        }),
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

  // ============= EXERCÍCIOS =============
  const openExercisesModal = async (workout) => {
    setSelectedWorkout(workout);
    setShowExercisesModal(true);
    setExercises([]);
    setLoadingExercises(true);
    try {
      const res = await fetch(
        `http://localhost:3333/exercises/${workout.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) setExercises(data);
      else setExercises([]);
    } catch (err) {
      console.error("Erro ao buscar exercícios:", err);
    } finally {
      setLoadingExercises(false);
    }
  };

  const closeExercisesModal = () => {
    setShowExercisesModal(false);
    setSelectedWorkout(null);
    setExerciseForm({
      name: "",
      series: "",
      repetitions: "",
      load: "",
      restTime: "",
      notes: "",
    });
  };

  const handleExerciseChange = (e) => {
    setExerciseForm({ ...exerciseForm, [e.target.name]: e.target.value });
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    if (!selectedWorkout) return;

    try {
      const res = await fetch(
        `http://localhost:3333/exercises/${selectedWorkout.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: exerciseForm.name,
            series: exerciseForm.series ? Number(exerciseForm.series) : null,
            repetitions: exerciseForm.repetitions || null,
            load: exerciseForm.load ? Number(exerciseForm.load) : null,
            restTime: exerciseForm.restTime || null,
            notes: exerciseForm.notes || null,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar exercício");
      setExercises((prev) => [...prev, data.exercise || data]);
      setExerciseForm({
        name: "",
        series: "",
        repetitions: "",
        load: "",
        restTime: "",
        notes: "",
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // ================= RENDER =================
  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <button className="btn btn-light mb-3" onClick={() => navigate(-1)}>
        ⬅ Voltar
      </button>

      <div className="card">
        <div className="card-body">
          <h4>{student.name}</h4>

          {/* Abas */}
          <ul className="nav nav-tabs mt-3">
            {["info", "treinos", "feedbacks", "progresso"].map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "info" && "📄 Informações"}
                  {tab === "treinos" && "🏋️ Treinos"}
                  {tab === "feedbacks" && "💬 Feedbacks"}
                  {tab === "progresso" && "📈 Progresso"}
                </button>
              </li>
            ))}
          </ul>

          {/* Conteúdo das abas */}
          <div className="mt-3">
            {/* ================= INFO ================= */}
            {activeTab === "info" && (
              <div>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Telefone:</strong> {student.phone || "-"}</p>
                <p><strong>Idade:</strong> {student.age || "-"}</p>
                <p><strong>Peso:</strong> {student.weight ? `${student.weight} kg` : "-"}</p>
                <p><strong>Altura:</strong> {student.height ? `${student.height} m` : "-"}</p>
                <p><strong>Objetivo:</strong> {student.goal || "-"}</p>
              </div>
            )}

            {/* ================= TREINOS ================= */}
            {activeTab === "treinos" && (
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
            )}

            {/* ================= FEEDBACKS ================= */}
            {activeTab === "feedbacks" && (
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
            )}

            {/* ================= PROGRESSO ================= */}
            {activeTab === "progresso" && (
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
                  <div className="table-responsive mt-3">
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
                            <td>{new Date(p.date).toLocaleDateString()}</td>
                            <td>{p.weight ?? "-"}</td>
                            <td>{p.chest ?? "-"}</td>
                            <td>{p.waist ?? "-"}</td>
                            <td>{p.arms ?? "-"}</td>
                            <td>{p.legs ?? "-"}</td>
                            <td>{p.observation || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
