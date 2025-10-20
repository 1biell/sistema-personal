import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", subscriptionPlan: "", subscriptionDueDate: "" });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3333/admin/users", { headers: { ...authHeader } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar usuários");
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line

  const createPersonal = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3333/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          subscriptionPlan: form.subscriptionPlan || undefined,
          subscriptionDueDate: form.subscriptionDueDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar personal");
      setForm({ name: "", email: "", password: "", subscriptionPlan: "", subscriptionDueDate: "" });
      fetchUsers();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const updateUser = async (id, patch) => {
    try {
      const res = await fetch(`http://localhost:3333/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar usuário");
      fetchUsers();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="container" style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>Admin • Gerenciar Usuários</h2>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Criar novo personal</h3>
        <form onSubmit={createPersonal} style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 10, alignItems: "end" }}>
          <div>
            <label>Nome</label>
            <input className="form-control" value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))} required />
          </div>
          <div>
            <label>Senha</label>
            <input type="password" className="form-control" value={form.password} onChange={(e)=>setForm(f=>({...f, password:e.target.value}))} required />
          </div>
          <div>
            <label>Plano</label>
            <input className="form-control" value={form.subscriptionPlan} onChange={(e)=>setForm(f=>({...f, subscriptionPlan:e.target.value}))} placeholder="Mensal/Trimestral..." />
          </div>
          <div>
            <label>Vencimento</label>
            <input type="date" className="form-control" value={form.subscriptionDueDate} onChange={(e)=>setForm(f=>({...f, subscriptionDueDate:e.target.value}))} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-primary" disabled={creating}>{creating ? "Criando..." : "Criar personal"}</button>
          </div>
        </form>
        {error && <p className="text-danger" style={{ marginTop: 8 }}>{error}</p>}
      </section>

      <section>
        <h3 style={{ marginBottom: 8 }}>Usuários</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Plano</th>
                  <th>Vencimento</th>
                  <th>Ativo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <input
                        className="form-control"
                        defaultValue={u.subscriptionPlan || ""}
                        onBlur={(e)=>updateUser(u.id, { subscriptionPlan: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="form-control"
                        defaultValue={u.subscriptionDueDate ? new Date(u.subscriptionDueDate).toISOString().slice(0,10) : ""}
                        onBlur={(e)=>updateUser(u.id, { subscriptionDueDate: e.target.value || null })}
                      />
                    </td>
                    <td>
                      <input type="checkbox" checked={!!u.active} onChange={(e)=>updateUser(u.id, { active: e.target.checked })} />
                    </td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={()=>{
                        const pwd = prompt("Nova senha para "+u.name+":");
                        if (pwd) updateUser(u.id, { password: pwd });
                      }}>Trocar senha</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

