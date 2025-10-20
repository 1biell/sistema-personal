import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subscriptionPlan: "",
    subscriptionDueDate: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3333/admin/users", { headers: { ...authHeader } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar usuários");
      setUsers(data.users || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line

  const createPersonal = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("http://localhost:3333/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar personal");
      toast.success("Personal criado com sucesso!");
      setForm({ name: "", email: "", password: "", subscriptionPlan: "", subscriptionDueDate: "" });
      fetchUsers();
    } catch (e) {
      toast.error(e.message);
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
      toast.success("Usuário atualizado!");
      fetchUsers();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Deseja realmente excluir ${name}?`)) return;
    try {
      const res = await fetch(`http://localhost:3333/admin/users/${id}`, {
        method: "DELETE",
        headers: { ...authHeader },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir usuário");
      toast.success("Usuário excluído com sucesso!");
      fetchUsers();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const personalsAtivos = users.filter((u) => u.role === "personal" && u.active).length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.subscriptionPlan?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? u.active && u.role !== "admin"
        : statusFilter === "inactive"
        ? !u.active && u.role !== "admin"
        : u.role === "admin";
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container" style={{ padding: 20 }}>
      <ToastContainer position="bottom-right" autoClose={2500} />
      <h2 style={{ marginBottom: 12 }}>Admin • Gerenciar Usuários</h2>

      <section style={{ marginBottom: 24 }}>
        <h3>Criar novo personal</h3>
        <form
          onSubmit={createPersonal}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(160px, 1fr))",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div>
            <label>Nome</label>
            <input className="form-control" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} required/>
          </div>
          <div>
            <label>Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} required/>
          </div>
          <div>
            <label>Senha</label>
            <input type="password" className="form-control" value={form.password} onChange={(e)=>setForm(f=>({...f,password:e.target.value}))} required/>
          </div>
          <div>
            <label>Plano</label>
            <input className="form-control" value={form.subscriptionPlan} onChange={(e)=>setForm(f=>({...f,subscriptionPlan:e.target.value}))} placeholder="Mensal/Trimestral..."/>
          </div>
          <div>
            <label>Vencimento</label>
            <input type="date" className="form-control" value={form.subscriptionDueDate} onChange={(e)=>setForm(f=>({...f,subscriptionDueDate:e.target.value}))}/>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-primary" disabled={creating}>{creating ? "Criando..." : "Criar personal"}</button>
          </div>
        </form>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3>Usuários</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Filtrar por nome ou plano..."
              className="form-control"
              style={{ width: 220 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="admin">Admins</option>
            </select>
            <span style={{ fontWeight: "bold" }}>Ativos: {personalsAtivos}</span>
          </div>
        </div>

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
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <input className="form-control" defaultValue={u.subscriptionPlan || ""} disabled={u.role==="admin"} onBlur={(e)=>u.role!=="admin"&&updateUser(u.id,{subscriptionPlan:e.target.value})}/>
                    </td>
                    <td>
                      <input type="date" className="form-control" defaultValue={u.subscriptionDueDate?new Date(u.subscriptionDueDate).toISOString().slice(0,10):""} disabled={u.role==="admin"} onBlur={(e)=>u.role!=="admin"&&updateUser(u.id,{subscriptionDueDate:e.target.value||null})}/>
                    </td>
                    <td>
                      <input type="checkbox" checked={!!u.active} disabled={u.role==="admin"} onChange={(e)=>u.role!=="admin"&&updateUser(u.id,{active:e.target.checked})}/>
                    </td>
                    <td style={{ display:"flex",gap:6 }}>
                      {u.role!=="admin"&&(
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={()=>{const pwd=prompt("Nova senha para "+u.name+":");if(pwd)updateUser(u.id,{password:pwd});}}>
                            Trocar senha
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={()=>deleteUser(u.id,u.name)}>
                           🗑️ Excluir
                          </button>
                        </>
                      )}
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
