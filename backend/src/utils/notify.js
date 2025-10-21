import dotenv from "dotenv";
dotenv.config();

// Envio de e-mails genéricos para notificações
export async function sendEmail(to, subject, html) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, EMAIL_DEBUG, EMAIL_LOG_SUCCESS } = process.env;
  const smtpHost = SMTP_HOST?.trim();
  const smtpPort = Number(String(SMTP_PORT || '').trim() || 0);
  const smtpUser = SMTP_USER?.trim();
  // Muitos provedores (ex. Gmail) fornecem app password com espaços visuais; removemos espaços.
  const smtpPass = (SMTP_PASS || "").replace(/\s+/g, "");
  const fromEmail = (FROM_EMAIL && FROM_EMAIL.trim()) || smtpUser;
  const emailDebug = (String(EMAIL_DEBUG || '').toLowerCase() === 'true') || (EMAIL_DEBUG === '1');
  const logSuccess = (String(EMAIL_LOG_SUCCESS || '').toLowerCase() === 'true') || (EMAIL_LOG_SUCCESS === '1');

  // Fallback em desenvolvimento quando SMTP não está configurado
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.log(`[DEV][EMAIL]\nTo: ${to}\nSubject: ${subject}\nHTML:\n${html}`);
    return;
  }

  let nodemailer;
  try {
    nodemailer = (await import("nodemailer")).default;
  } catch (e) {
    console.log(`[DEV] Nodemailer não instalado. E-mail para ${to}: ${subject}`);
    return;
  }

  const transportOptions = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  };
  if (emailDebug) {
    transportOptions.logger = true;
    transportOptions.debug = true;
  }
  const transporter = nodemailer.createTransport(transportOptions);

  const from = fromEmail;
  try {
    await transporter.sendMail({ from, to, subject, html });
    if (logSuccess || emailDebug) {
      console.log(`[EMAIL] Enviado para ${to} | Assunto: ${subject}`);
    }
  } catch (err) {
    console.error(`[EMAIL][ERRO] Falha ao enviar para ${to}:`, {
      name: err?.name,
      code: err?.code,
      command: err?.command,
      response: err?.response,
      message: err?.message,
    });
    throw err;
  }
}
