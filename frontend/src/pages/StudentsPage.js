import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext"; // 👈 Importa o tema

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    age: "",
    weight: "",
    height: "",
    goal: "",
    phone: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { theme } = useTheme(); // 👈 Usa o tema atual

  // === Buscar alunos ===
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:3333/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setStudents(data);
      } catch (err) {
        console.error("Erro ao buscar alunos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

  // === Abrir/fechar modal ===
  const toggleModal = () => setShowModal(!showModal);

  // === Atualizar campos ===
  const handleChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  // === Criar novo aluno ===
  const handleCreateStudent = async () => {
    try {
      const res = await fetch("http://localhost:3333/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStudent),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Aluno cadastrado com sucesso!");
        setStudents((prev) => [...prev, data.student]);
        setShowModal(false);
        setNewStudent({
          name: "",
          email: "",
          age: "",
          weight: "",
          height: "",
          goal: "",
          phone: "",
        });
      } else {
        alert(data.error || "Erro ao cadastrar aluno");
      }
    } catch (err) {
      alert("Erro ao cadastrar aluno");
      console.error(err);
    }
  };

  if (loading) return <p>Carregando alunos...</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3
          style={{
            color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
            transition: "color 0.3s ease",
          }}
        >
          👥 Lista de Alunos
        </h3>
        <button className="btn btn-primary" onClick={toggleModal}>
          + Novo Aluno
        </button>
      </div>

      {students.length === 0 ? (
        <p style={{ color: theme === "dark" ? "#ccc" : "#1f1f1f" }}>
          Nenhum aluno cadastrado.
        </p>
      ) : (
        <div className="row mt-3">
          {students.map((student) => (
            <div className="col-md-4 mb-3" key={student.id}>
              <div
                className="card shadow-sm"
                style={{
                  cursor: "pointer",
                  backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
                  color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
                  border: theme === "dark" ? "1px solid #333" : "1px solid #ddd",
                  transition: "all 0.3s ease",
                }}
                onClick={() => navigate(`/students/${student.id}`)}
              >
                <div className="card-body">
                  <h5
                    style={{
                      color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
                      fontWeight: "600",
                    }}
                  >
                    {student.name}
                  </h5>
                  <p
                    style={{
                    color: theme === "dark" ? "#e0e0e0" : "#6c757d", // 👈 texto claro no escuro
                    fontSize: "0.9rem",
                    marginBottom: 0,
                    }}
                >
                  {student.email}
                </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==== Modal de Novo Aluno ==== */}
      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog">
            <div
              className="modal-content"
              style={{
                backgroundColor: theme === "dark" ? "#2c2c2c" : "#fff",
                color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title">Cadastrar Novo Aluno</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={toggleModal}
                ></button>
              </div>

              <div className="modal-body">
                {[
                  { label: "Nome", name: "name", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Idade", name: "age", type: "number" },
                  { label: "Peso (kg)", name: "weight", type: "number" },
                  { label: "Altura (m)", name: "height", type: "number", step: "0.01" },
                  { label: "Objetivo", name: "goal", type: "text" },
                  { label: "Telefone", name: "phone", type: "text" },
                ].map((field) => (
                  <div className="mb-3" key={field.name}>
                    <label className="form-label">{field.label}</label>
                    <input
                      type={field.type}
                      step={field.step || undefined}
                      name={field.name}
                      value={newStudent[field.name]}
                      onChange={handleChange}
                      className="form-control"
                      style={{
                        backgroundColor: theme === "dark" ? "#1f1f1f" : "#fff",
                        color: theme === "dark" ? "#f8f9fa" : "#1f1f1f",
                        borderColor: theme === "dark" ? "#444" : "#ccc",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={toggleModal}>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={handleCreateStudent}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
