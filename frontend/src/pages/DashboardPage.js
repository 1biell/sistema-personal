import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Campos do formulário de novo aluno
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    weight: "",
    height: "",
    goal: "",
  });

  // Buscar alunos cadastrados
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar alunos");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token]);

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envia o formulário para cadastrar aluno
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/students", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents([...students, res.data.student]);
      setShowModal(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        age: "",
        weight: "",
        height: "",
        goal: "",
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar aluno. Verifique os dados.");
    }
  };

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>👋 Bem-vindo, {user?.name}</h2>
        <button onClick={logout} className="btn btn-outline-danger">
          Sair
        </button>
      </div>

      {/* Card principal */}
      <div className="card p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Seus alunos cadastrados</h4>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Novo Aluno
          </button>
        </div>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && students.length === 0 && (
          <p>Nenhum aluno cadastrado ainda.</p>
        )}

        {!loading && students.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Objetivo</th>
                  <th>Peso</th>
                  <th>Altura</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.goal || "-"}</td>
                    <td>{s.weight ? `${s.weight} kg` : "-"}</td>
                    <td>{s.height ? `${s.height} m` : "-"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          (window.location.href = `/student/${s.id}`)
                        }
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de cadastro */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cadastrar novo aluno</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Telefone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Idade</label>
                      <input
                        name="age"
                        type="number"
                        value={form.age}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Peso (kg)</label>
                      <input
                        name="weight"
                        type="number"
                        step="0.1"
                        value={form.weight}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Altura (m)</label>
                      <input
                        name="height"
                        type="number"
                        step="0.01"
                        value={form.height}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Objetivo</label>
                    <input
                      name="goal"
                      value={form.goal}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
