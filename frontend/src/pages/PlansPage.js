import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PLANS = [
  { code: "basico", name: "Básico", price: "R$ 29,99/mês", limit: "5 alunos", features: ["Cadastro e gestão de alunos", "Treinos e feedbacks", "Suporte por e-mail"] },
  { code: "avancado", name: "Avançado", price: "R$ 49,99/mês", limit: "20 alunos", features: ["Tudo do Básico", "Dashboards avançados", "Suporte prioritário"] },
  { code: "ilimitado", name: "Ilimitado", price: "R$ 89,99/mês", limit: "Ilimitado", features: ["Tudo do Avançado", "Alunos ilimitados", "Atendimento dedicado"] },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = location.state?.reason;

  return (
    <div className="login-page">
      <div className="login-hero" aria-hidden="true" />
      <div className="login-card" style={{ maxWidth: 960 }}>
        <h2 style={{ textAlign: "center", marginBottom: 6 }}>Assine o Sistema Personal</h2>
        {reason === "TRIAL_EXPIRED" && (
          <div className="alert alert-warning" role="alert" style={{ marginBottom: 16 }}>
            Seu período de teste expirou. Para continuar, escolha um plano abaixo.
          </div>
        )}
        <p className="text-muted" style={{ textAlign: "center", marginBottom: 24 }}>
          Planos simples e objetivos. Escolha o que combina com o seu momento.
        </p>

        <div className="row" style={{ gap: 16, justifyContent: "center" }}>
          {PLANS.map((p) => (
            <div key={p.code} className="card shadow-sm" style={{ width: 280 }}>
              <div className="card-body d-flex flex-column">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h4 className="card-title" style={{ marginBottom: 0 }}>{p.name}</h4>
                  <span className="badge bg-primary">{p.limit}</span>
                </div>
                <h5 className="card-subtitle mb-2 text-muted" style={{ marginTop: 8 }}>{p.price}</h5>
                <ul style={{ paddingLeft: 18, marginTop: 8, marginBottom: 16 }}>
                  {p.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <button className="btn btn-primary w-100" onClick={() => alert("Fale com o administrador para contratar.")}>Quero esse plano</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p className="text-muted" style={{ marginBottom: 6 }}>Para contratar, entre em contato:</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="mailto:suporte@seusistema.com" className="btn btn-outline-secondary">suporte@seusistema.com</a>
            <a href="https://wa.me/550000000000" target="_blank" rel="noreferrer" className="btn btn-outline-success">WhatsApp</a>
            <button className="btn btn-link" onClick={() => navigate("/login")}>Voltar ao login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
