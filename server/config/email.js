import nodemailer from "nodemailer";

const FROM_NAME = "Adriana Villalobos · Montessori 0–3";

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      // Contraseña de aplicación de Google (16 letras); se permiten espacios al copiarla
      pass: process.env.EMAIL_PASS.replace(/\s+/g, ""),
    },
  });
};

function siteUrl() {
  return (
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173")
  ).replace(/\/$/, "");
}

/** Escapa texto que viene de usuarios (nombres, notas) antes de meterlo en HTML */
export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(body) {
  return `
  <div style="background:#FCF9F4;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#3B3630">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E8DFCF;border-radius:20px;padding:32px">
      ${body}
      <hr style="border:0;border-top:1px solid #E8DFCF;margin:28px 0 16px">
      <p style="font-size:12px;color:#7C736A;margin:0">
        Adriana Villalobos · Montessori 0–3<br>
        <a href="${siteUrl()}" style="color:#4E6553">${siteUrl().replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  </div>`;
}

function button(href, label) {
  return `<p style="margin:24px 0"><a href="${href}" style="background:#4E6553;color:#fff;padding:12px 22px;border-radius:100px;text-decoration:none;font-weight:600">${label}</a></p>`;
}

export const sendEmail = async ({ to, subject, html, replyTo }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email simulado] Para: ${to} | Asunto: ${subject}`);
    return { success: true, simulated: true };
  }
  try {
    const result = await transporter.sendMail({
      from: { name: FROM_NAME, address: process.env.EMAIL_USER },
      to,
      replyTo,
      subject,
      html: layout(html),
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { success: false, error: error.message };
  }
};

/** Aviso interno para Adriana (ADMIN_NOTIFY_EMAIL o, si no existe, la misma cuenta que envía) */
export const notifyAdmin = ({ subject, html, replyTo }) => {
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;
  if (!to) {
    console.log(`[Aviso admin simulado] ${subject}`);
    return Promise.resolve({ success: true, simulated: true });
  }
  return sendEmail({ to, subject, html: `${html}${button(`${siteUrl()}/admin`, "Abrir panel")}`, replyTo });
};

export const sendWelcomeEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: "Bienvenida a tu espacio Montessori",
    html: `<h2 style="font-weight:400">Hola ${esc(name)} 🌱</h2>
      <p>Tu cuenta quedó creada. Desde tu panel puedes completar el perfil de tu familia y reservar tu asesoría en línea.</p>
      <p>Si es tu primera vez, tu primera asesoría de 30 minutos es <b>gratis</b>.</p>
      ${button(`${siteUrl()}/citas/nueva`, "Reservar mi asesoría")}`,
  });

export const sendAppointmentRequestedEmail = (email, name, date, serviceType) =>
  sendEmail({
    to: email,
    subject: "Recibí tu solicitud de asesoría",
    html: `<h2 style="font-weight:400">Hola ${esc(name)}</h2>
      <p>Recibí tu solicitud de <b>${esc(serviceType)}</b> para el <b>${esc(date)}</b>.</p>
      <p>Te confirmaré por correo con el enlace de la videollamada. Si necesitas cambiar algo, responde a este correo.</p>
      ${button(`${siteUrl()}/citas`, "Ver mis citas")}`,
  });

export const sendAppointmentConfirmedEmail = (email, name, date, meetingLink) =>
  sendEmail({
    to: email,
    subject: "Tu asesoría está confirmada",
    html: `<h2 style="font-weight:400">Hola ${esc(name)}</h2>
      <p>Tu sesión del <b>${esc(date)}</b> está confirmada.</p>
      ${meetingLink ? button(meetingLink, "Unirme a la videollamada") : "<p>Te enviaré el enlace de la videollamada antes de la sesión.</p>"}`,
  });

export const sendSessionNotePublishedEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: "Nueva nota de sesión disponible",
    html: `<h2 style="font-weight:400">Hola ${esc(name)}</h2>
      <p>Publiqué una nueva nota de sesión con observaciones y recomendaciones para tu familia.</p>
      ${button(`${siteUrl()}/sesiones`, "Ver mis sesiones")}`,
  });

export const sendGuideRequestedEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: "Tu guía: 25 cambios Montessori en casa",
    html: `<h2 style="font-weight:400">Hola ${esc(name)}</h2>
      <p>¡Gracias por tu interés! Recibí tu solicitud de la guía <b>“25 cambios Montessori que puedes hacer en casa sin comprar materiales caros”</b> y te la enviaré muy pronto a este correo.</p>`,
  });
