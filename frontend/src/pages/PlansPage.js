import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/PlansPage.css";

const PLANS = [
  {
    code: "basico",
    name: "Básico",
    price: "R$ 29,99",
    tag: "Para começar",
    limit: "5 alunos",
    features: [
      "Cadastro e gestão de alunos",
      "Treinos e feedbacks",
      "Relatórios simples",
      "Suporte por e-mail",
    ],
  },
  {
    code: "avancado",
    name: "Avançado",
    price: "R$ 49,99",
    tag: "Mais popular",
    featured: true,
    limit: "20 alunos",
    features: [
      "Tudo do Básico",
      "Dashboards avançados",
      "Modelos de treinos",
      "Suporte prioritário",
    ],
  },
  {
    code: "ilimitado",
    name: "Ilimitado",
    price: "R$ 89,99",
    tag: "Para escalar",
    limit: "Ilimitado",
    features: [
      "Tudo do Avançado",
      "Alunos ilimitados",
      "Atendimento dedicado",
      "Relatórios avançados",
    ],
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = location.state?.reason;

  const contactMail = "suporte@seusistema.com";
  const contactWhats = "https://wa.me/550000000000"; // ajuste para o seu número

  return (
    <div className="plans">
      <div className="plans-hero">
        <div className="plans-hero-inner">
          <h1>Escolha seu plano</h1>
          <p>Comece com 7 dias grátis. Sem cartão de crédito.</p>
          {reason === "TRIAL_EXPIRED" && (
            <div className="alert alert-warning plans-hero-alert" role="alert">
              Seu período de teste expirou. Para continuar, assine um plano.
            </div>
          )}
        </div>
      </div>

      <div className="container plans-container">
        <div className="row g-4 justify-content-center">
          {PLANS.map((p) => (
            <div key={p.code} className="col-12 col-md-6 col-lg-4 d-flex">
              <div className={`plan-card card shadow-sm w-100 ${p.featured ? "plan-featured" : ""}`}>
                {p.tag && <span className={`plan-tag ${p.featured ? "plan-tag-primary" : ""}`}>{p.tag}</span>}
                <div className="card-body d-flex flex-column">
                  <h4 className="plan-title">{p.name}</h4>
                  <div className="plan-price">
                    <span className="plan-amount">{p.price}</span>
                    <span className="plan-period">/ mês</span>
                  </div>
                  <div className="plan-limit">Limite: {p.limit}</div>

                  <ul className="plan-features list-unstyled mt-3 mb-4">
                    {p.features.map((f, i) => (
                      <li key={i}>
                        <span className="check">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <a
                      href={contactWhats}
                      target="_blank"
                      rel="noreferrer"
                      className={`btn w-100 ${p.featured ? "btn-primary" : "btn-outline-primary"}`}
                    >
                      Falar no WhatsApp
                    </a>
                    <a href={`mailto:${contactMail}`} className="btn btn-link w-100 mt-1">
                      ou enviar e-mail
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="plans-extra mt-5">
          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-lg-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5>Por que assinar agora?</h5>
                  <ul className="mb-0">
                    <li>Organize seus alunos e treinos com rapidez.</li>
                    <li>Economize tempo com modelos e relatórios.</li>
                    <li>Suporte para te ajudar a crescer.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5>Tem dúvidas?</h5>
                  <p className="text-muted">Fale com a gente e tire todas as dúvidas sobre os planos e a contratação.</p>
                  <div className="mt-auto d-flex gap-2 flex-wrap">
                    <a href={contactWhats} target="_blank" rel="noreferrer" className="btn btn-success">
                      WhatsApp
                    </a>
                    <a href={`mailto:${contactMail}`} className="btn btn-secondary">
                      Enviar e-mail
                    </a>
                    <button className="btn btn-link" onClick={() => navigate("/login")}>Voltar ao login</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
