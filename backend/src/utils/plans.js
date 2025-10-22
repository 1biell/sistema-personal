export const PLANS = {
  trial: {
    code: "trial",
    name: "Teste Grátis 7 dias",
    priceBRL: 0,
    studentLimit: Infinity, // conforme pedido: ilimitado durante o teste
    isTrial: true,
    durationDays: 7,
  },
  basico: {
    code: "basico",
    name: "Básico",
    priceBRL: 29.99,
    studentLimit: 5,
  },
  avancado: {
    code: "avancado",
    name: "Avançado",
    priceBRL: 49.99,
    studentLimit: 20,
  },
  ilimitado: {
    code: "ilimitado",
    name: "Ilimitado",
    priceBRL: 89.99,
    studentLimit: Infinity,
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

