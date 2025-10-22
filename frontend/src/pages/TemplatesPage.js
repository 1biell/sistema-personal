import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TemplatesPage() {
  const token = localStorage.getItem("token");
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // template being edited
  const [form, setForm] = useState({ title: "", description: "", dayOfWeek: "", exercises: [] });

  const [applyModal, setApplyModal] = useState({ open: false, templateId: null });
  const [students, setStudents] = useState([]);
  const [applyStudentId, setApplyStudentId] = useState("");

  const navigate = useNavigate();

  const resetForm = () => {
    setForm({ title: "", description: "", dayOfWeek: "", exercises: [] });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title || "",
      description: t.description || "",
      dayOfWeek: t.dayOfWeek || "",
      exercises: (t.exercises || []).map((e) => ({
        name: e.name || "",
        series: e.series ?? "",
        repetitions: e.repetitions || "",
        load: e.load ?? "",
        restTime: e.restTime || "",
        notes: e.notes || "",
      })),
    });
    setShowModal(true);
  };

  const addExercise = () => {
    setForm((f) => ({ ...f, exercises: [...(f.exercises || []), { name: "", series: "", repetitions: "", load: "", restTime: "", notes: "" }] }));
  };
  const updateExercise = (idx, field, value) => {
    setForm((f) => {
      const next = [...(f.exercises || [])];
      next[idx] = { ...next[idx], [field]: value };
      return { ...f, exercises: next };
    });
  };
  const removeExercise = (idx) => {
    setForm((f) => ({ ...f, exercises: (f.exercises || []).filter((_, i) => i !== idx) }));
  };

  const fetchTemplates = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3333/templates", { headers: { ...authHeader } });
      if (res.status === 403) {
        try {
          const dataErr = await res.json();
          if (dataErr?.code === "TRIAL_EXPIRED") return navigate("/assinar", { state: { reason: "TRIAL_EXPIRED" } });
          if (dataErr?.code === "CAPABILITY_DENIED") return navigate("/assinar", { state: { reason: "UPGRADE_REQUIRED" } });
        } catch {}
        throw new Error("Acesso negado");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao listar modelos");
      setTemplates(data.templates || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []); // eslint-disable-line

  const saveTemplate = async () => {
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        dayOfWeek: form.dayOfWeek || undefined,
        exercises: (form.exercises || []).map((e) => ({
          name: e.name,
          series: e.series ? Number(e.series) : undefined,
          repetitions: e.repetitions || undefined,
          load: e.load !== "" ? Number(e.load) : undefined,
          restTime: e.restTime || undefined,
          notes: e.notes || undefined,
        })),
      };
      const url = editing ? `http://localhost:3333/templates/${editing.id}` : `http://localhost:3333/templates`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar modelo");
      setShowModal(false);
      resetForm();
      fetchTemplates();
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteTemplate = async (id, title) => {
    if (!window.confirm(`Excluir modelo "${title}"?`)) return;
    try {
      const res = await fetch(`http://localhost:3333/templates/${id}`, { method: "DELETE", headers: { ...authHeader } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir modelo");
      fetchTemplates();
    } catch (e) {
      alert(e.message);
    }
  };

  const openApplyModal = async (templateId) => {
    setApplyModal({ open: true, templateId });
    setApplyStudentId("");
    // carregar alunos do personal
    try {
      const res = await fetch("http://localhost:3333/students", { headers: { ...authHeader } });
      const data = await res.json();
      if (Array.isArray(data)) setStudents(data);
    } catch {}
  };

  const applyTemplate = async () => {
    try {
      if (!applyStudentId) return alert("Selecione um aluno");
      const res = await fetch(`http://localhost:3333/templates/${applyModal.templateId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ studentId: applyStudentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao aplicar modelo");
      alert("Modelo aplicado com sucesso!");
      setApplyModal({ open: false, templateId: null });
      setApplyStudentId("");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Modelos de Treinos</h3>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo modelo</button>
      </div>

      {loading ? (
        <p>Carregando modelos...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : templates.length === 0 ? (
        <p>Nenhum modelo cadastrado ainda.</p>
      ) : (
        <div className="row g-3">
          {templates.map((t) => (
            <div key={t.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="mb-1">{t.title}</h5>
                  <p className="text-muted mb-2" style={{ minHeight: 40 }}>{t.description || "Sem descrição"}</p>
                  <small className="mb-2">Dia: {t.dayOfWeek || "-"} • Exercícios: {t.exercises?.length || 0}</small>
                  <div className="mt-auto d-flex gap-2 flex-wrap">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => openEdit(t)}>Editar</button>
                    <button className="btn btn-outline-success btn-sm" onClick={() => openApplyModal(t.id)}>Aplicar em aluno</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteTemplate(t.id, t.title)}>Excluir</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? "Editar modelo" : "Novo modelo"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descrição</label>
                  <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Dia da semana</label>
                  <input className="form-control" placeholder="ex.: Segunda" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })} />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="m-0">Exercícios</h6>
                  <button className="btn btn-sm btn-outline-secondary" onClick={addExercise}>+ Adicionar exercício</button>
                </div>

                {(form.exercises || []).length === 0 ? (
                  <p className="text-muted">Nenhum exercício adicionado.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Séries</th>
                          <th>Repetições</th>
                          <th>Carga (kg)</th>
                          <th>Descanso</th>
                          <th>Notas</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.exercises.map((ex, idx) => (
                          <tr key={idx}>
                            <td><input className="form-control form-control-sm" value={ex.name} onChange={(e) => updateExercise(idx, "name", e.target.value)} /></td>
                            <td style={{ width: 90 }}><input type="number" className="form-control form-control-sm" value={ex.series} onChange={(e) => updateExercise(idx, "series", e.target.value)} /></td>
                            <td><input className="form-control form-control-sm" value={ex.repetitions} onChange={(e) => updateExercise(idx, "repetitions", e.target.value)} /></td>
                            <td style={{ width: 110 }}><input type="number" className="form-control form-control-sm" value={ex.load} onChange={(e) => updateExercise(idx, "load", e.target.value)} /></td>
                            <td><input className="form-control form-control-sm" value={ex.restTime} onChange={(e) => updateExercise(idx, "restTime", e.target.value)} /></td>
                            <td><input className="form-control form-control-sm" value={ex.notes} onChange={(e) => updateExercise(idx, "notes", e.target.value)} /></td>
                            <td style={{ width: 60 }}>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => removeExercise(idx)}>X</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-success" onClick={saveTemplate}>{editing ? "Salvar" : "Criar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aplicar */}
      {applyModal.open && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Aplicar modelo</h5>
                <button className="btn-close" onClick={() => setApplyModal({ open: false, templateId: null })} />
              </div>
              <div className="modal-body">
                <label className="form-label">Selecione o aluno</label>
                <select className="form-select" value={applyStudentId} onChange={(e) => setApplyStudentId(e.target.value)}>
                  <option value="">-- Escolha --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setApplyModal({ open: false, templateId: null })}>Cancelar</button>
                <button className="btn btn-success" onClick={applyTemplate} disabled={!applyStudentId}>Aplicar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

