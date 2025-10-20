import dotenv from "dotenv";
dotenv.config();

// Envia e-mail de redefinição de senha.
// Caso SMTP não esteja configurado ou nodemailer não instalado,
// faz fallback para logar o link no console (ambiente dev).
export async function sendPasswordResetEmail(to, resetLink) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

  // Fallback se SMTP não estiver configurado
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log(`[DEV] Password reset link for ${to}: ${resetLink}`);
    return;
  }

  let nodemailer;
  try {
    nodemailer = (await import("nodemailer")).default;
  } catch (e) {
    console.log(`[DEV] Nodemailer não instalado. Link de redefinição para ${to}: ${resetLink}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const from = FROM_EMAIL || SMTP_USER;
  const subject = "Redefinição de senha - Sistema Personal";
  const html = `
    <p>Você solicitou a redefinição de senha.</p>
    <p>Clique no link para criar uma nova senha (válido por 1 hora):</p>
    <p><a href="${resetLink}" target="_blank" rel="noopener">Redefinir senha</a></p>
    <p>Se você não fez essa solicitação, ignore este e-mail.</p>
  `;

  await transporter.sendMail({ from, to, subject, html });
}

