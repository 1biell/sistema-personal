# Sistema Personal — (Backend + Frontend)

Aplicação para gestão de alunos, treinos, progresso e planos, com autenticação JWT e interface React.

## Sumário
- Visão Geral
- Arquitetura e Tecnologias
- Requisitos
- Configuração do Backend
- Configuração do Frontend
- Execução (dev e produção)
- Fluxo de Autenticação
- Principais Rotas da API
- Estrutura de Pastas
- Dicas e Solução de Problemas

## Visão Geral
- Backend: API REST em Node.js/Express com Prisma e PostgreSQL, autenticação por JWT e envio de e‑mails para recuperação de senha.
- Frontend: React + React Router, Bootstrap, gráficos com Chart.js e tema escuro customizado.

## Arquitetura e Tecnologias
- Backend
  - Node.js, Express 5, Prisma ORM, PostgreSQL
  - JWT (jsonwebtoken), bcryptjs
  - Nodemailer para e‑mails de reset
  - dotenv, cors
- Frontend
  - React 19, React Router DOM 7
  - Bootstrap 5, React-Toastify
  - Chart.js + react-chartjs-2
  - Tema em `src/styles/theme.css` e telas de auth em `src/styles/LoginPage.css`

## Requisitos
- Node.js 18+ e npm
- PostgreSQL 13+
- Conta de e‑mail com App Password (ex.: Gmail) para reset de senha
- Portas padrão
  - Backend: `3333`
  - Frontend: `3000`

## Configuração do Backend
Caminho: `backend/`

1) Instalação
```
cd backend
npm install
```

2) Variáveis de ambiente: crie `backend/.env` (não commitar). Exemplo:
```
DATABASE_URL="postgresql://USER:PASS@localhost:5432/sistema_personal?schema=public"
JWT_SECRET="uma_chave_bem_secreta"
PORT=3333

# URL pública do frontend (para links de e-mail)
APP_URL=http://localhost:3000

# SMTP (ex.: Gmail com App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=seu_email@gmail.com
SMTP_PASS=senha_de_app_16_chars
FROM_EMAIL="Seu Nome <seu_email@gmail.com>"
```

3) Banco e Prisma
```
# criar/rodar migrações
npx prisma migrate dev
# opcional: visualizar no navegador
npx prisma studio
```

4) Scripts
- `npm run dev` — inicia com nodemon
- `npm start` — inicia com node

## Configuração do Frontend
Caminho: `frontend/`

1) Instalação
```
cd frontend
npm install
```

2) Base URL da API
- Arquivo: `frontend/src/api/api.js`
- Ajuste `baseURL` para o endereço do backend em produção se necessário.

3) Scripts
- `npm start` — ambiente de desenvolvimento
- `npm run build` — build de produção (saída em `frontend/build`)

## Execução
### Desenvolvimento (2 terminais)
Terminal 1 (API):
```
cd backend
npm run dev
```
Terminal 2 (Web):
```
cd frontend
npm start
```
Acesse: `http://localhost:3000`

### Produção (exemplo simplificado)
- Backend
  - Configure `.env` e banco de produção
  - `cd backend && npm ci && npm start`
  - Publique atrás de um reverse proxy (Nginx) com HTTPS
- Frontend
  - `cd frontend && npm ci && npm run build`
  - Sirva `frontend/build` (Nginx, Vercel, etc.)
  - Garanta que `baseURL` da API aponte para o backend público

## Fluxo de Autenticação
- Cadastro: `POST /auth/register` cria conta e inicia período de teste (7 dias). A tela de cadastro exibe esse aviso.
- Login: `POST /auth/login` retorna JWT e dados do usuário; o front persiste sessão.
- Esqueci minha senha: `POST /auth/forgot-password` envia e‑mail com link.
- Redefinir senha: `POST /auth/reset-password` consome token e define nova senha.
- Telas relevantes
  - Login: `frontend/src/pages/LoginPage.js`
  - Criar Conta: `frontend/src/pages/RegisterPage.js`
  - Esqueci/Reset: `frontend/src/pages/ForgotPasswordPage.js`, `frontend/src/pages/ResetPasswordPage.js`

## Principais Rotas da API
Arquivos de rotas em `backend/src/routes/`.

- Auth (`authRoutes.js`)
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
- Alunos (`studentsRoutes.js`): `GET/POST/PUT/DELETE /students`
- Treinos (`workoutsRoutes.js`): `GET/POST/PUT/DELETE /workouts`
- Exercícios (`exercisesRoutes.js`): `GET /exercises`
- Feedbacks (`feedbackRoutes.js`): `GET/POST /feedbacks`
- Progresso (`progressRoutes.js`): `GET/POST /progress`
- Modelos de treino (`templatesRoutes.js`): `GET/POST /templates`
- Dashboard (`dashboardRoutes.js`): `GET /dashboard`
- Admin (`adminRoutes.js`)
  - `GET /admin/users`
  - `GET /admin/users/:id`
  - `POST /admin/users`
  - `PATCH /admin/users/:id`
  - `PATCH /admin/users/:id/plan`
  - `DELETE /admin/users/:id`

Observação: rotas protegidas usam middlewares de JWT (ver `backend/src/middlewares/`).

## Estrutura de Pastas
```
backend/
  src/
    controllers/
    middlewares/
    routes/
    utils/
    server.js
  prisma/
    schema.prisma
    migrations/
  package.json

frontend/
  public/
  src/
    api/
    components/
    context/
    pages/
    styles/
    App.js
  package.json
```


