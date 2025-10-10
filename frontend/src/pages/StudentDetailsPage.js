import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ✅ Corrigido: os componentes ficam em src/components/student/
import StudentInfo from "../components/student/StudentInfo";
import StudentWorkouts from "../components/student/StudentWorkouts";
import StudentFeedbacks from "../components/student/StudentFeedbacks";
import StudentProgress from "../components/student/StudentProgress";

// ✅ CSS dentro de src/styles/
import "../styles/student.css";

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  // === Buscar aluno específico ===
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`http://localhost:3333/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setStudent(data);
        else setError(data?.error || "Erro ao carregar aluno");
      } catch {
        setError("Erro ao carregar informações do aluno");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, token]);

  if (loading) return <p>Carregando dados...</p>;
  if (error) return <p>{error}</p>;
  if (!student) return <p>Aluno não encontrado.</p>;

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅ Voltar
      </button>

      <div className="card shadow-sm">
        <div className="card-body">
          <h4>{student.name}</h4>
          <p className="text-muted">{student.email}</p>

          {/* === Abas === */}
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

          {/* === Conteúdo das abas === */}
          <div className="mt-3">
            {activeTab === "info" && <StudentInfo student={student} />}
            {activeTab === "treinos" && <StudentWorkouts id={id} token={token} />}
            {activeTab === "feedbacks" && <StudentFeedbacks id={id} token={token} />}
            {activeTab === "progresso" && <StudentProgress id={id} token={token} />}
          </div>
        </div>
      </div>
    </div>
  );
}
