export const PLANS = {
  trial: {
    code: "trial",
    name: "Teste Grátis 7 dias",
    priceBRL: 0,
    studentLimit: Infinity, // conforme pedido: ilimitado durante o teste
    isTrial: true,
    durationDays: 7,
    capabilities: ["core", "dashboard"],
  },
  basico: {
    code: "basico",
    name: "Básico",
    priceBRL: 29.99,
    studentLimit: 5,
    capabilities: ["core"],
  },
  avancado: {
    code: "avancado",
    name: "Avançado",
    priceBRL: 49.99,
    studentLimit: 20,
    capabilities: ["core", "dashboard", "templates"],
  },
  ilimitado: {
    code: "ilimitado",
    name: "Ilimitado",
    priceBRL: 89.99,
    studentLimit: Infinity,
    capabilities: ["core", "dashboard", "templates"],
  },
};

export const getStudentLimitForPlan = (planCode) => {
  if (!planCode) return 0;
  const key = String(planCode).toLowerCase();
  return PLANS[key]?.studentLimit ?? 0;
};

export const isUnlimitedPlan = (planCode) => {
  const limit = getStudentLimitForPlan(planCode);
  return limit === Infinity;
};

export const hasCapability = (planCode, capability) => {
  if (!planCode) return false;
  const key = String(planCode).toLowerCase();
  const caps = PLANS[key]?.capabilities || [];
  return caps.includes(capability);
};
