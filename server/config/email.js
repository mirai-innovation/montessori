import nodemailer from "nodemailer";
import { siteUrl } from "./site.js";

const FROM_NAME = "Adriana Villalobos · Montessori 0–3";
const INSTAGRAM = "https://instagram.com/narebyadriana";

const C = {
  paper: "#FCF9F4",
  cream: "#F4EDE2",
  sage: "#4E6553",
  sageSoft: "#E5EBE4",
  clay: "#B06A4F",
  claySoft: "#F0E0D6",
  ink: "#3B3630",
  text: "#544D45",
  muted: "#7C736A",
  line: "#E8DFCF",
};

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

/** Escapa texto que viene de usuarios (nombres, notas) antes de meterlo en HTML */
export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------- piezas de diseño (HTML compatible con clientes de correo) ---------- */

const h = (text) =>
  `<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:26px;line-height:1.25;color:${C.ink};margin:0 0 16px">${text}</h1>`;

const p = (text) => `<p style="font-size:15px;line-height:1.65;color:${C.text};margin:0 0 14px">${text}</p>`;

const button = (href, label, color = C.sage) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0"><tr><td style="background:${color};border-radius:100px">
    <a href="${href}" style="display:inline-block;padding:13px 26px;color:#fff;font-weight:600;font-size:15px;text-decoration:none">${label}</a>
  </td></tr></table>`;

/** Recuadro con filas etiqueta / valor (detalles de una cita) */
const details = (rows) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};border-radius:14px;margin:6px 0 18px">
    ${rows
      .filter(([, v]) => v)
      .map(
        ([k, v]) => `<tr>
          <td style="padding:12px 16px;font-size:13px;color:${C.muted};vertical-align:top;width:34%">${k}</td>
          <td style="padding:12px 16px;font-size:14px;color:${C.ink};font-weight:600">${v}</td>
        </tr>`
      )
      .join("")}
  </table>`;

/** Lista con viñetas verdes */
const list = (items) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 16px">
    ${items
      .map(
        (it) => `<tr>
          <td style="vertical-align:top;padding:4px 10px 4px 0;color:${C.sage};font-size:15px">●</td>
          <td style="padding:4px 0;font-size:15px;line-height:1.55;color:${C.text}">${it}</td>
        </tr>`
      )
      .join("")}
  </table>`;

const note = (text) =>
  `<p style="background:${C.claySoft};border-radius:12px;padding:12px 16px;font-size:14px;line-height:1.55;color:#6b4a3d;margin:0 0 16px">${text}</p>`;

const signature = () =>
  `<p style="font-size:15px;line-height:1.6;color:${C.text};margin:22px 0 0">
    Con cariño,<br>
    <span style="font-family:Georgia,serif;font-style:italic;font-size:18px;color:${C.sage}">Adriana Villalobos</span><br>
    <span style="font-size:13px;color:${C.muted}">Guía Montessori AMI 0–3 · Sesiones en línea</span>
  </p>`;

function layout(body, preheader = "") {
  const site = siteUrl();
  return `<!doctype html><html lang="es"><body style="margin:0;background:${C.paper}">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:28px 12px;font-family:Helvetica,Arial,sans-serif">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">
        <tr><td style="padding:0 6px 16px">
          <a href="${site}" style="text-decoration:none">
            <span style="font-family:Georgia,serif;font-size:19px;font-weight:600;color:${C.ink}">🌿 Adriana Villalobos</span><br>
            <span style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.sage}">Montessori 0–3</span>
          </a>
        </td></tr>
        <tr><td style="background:#fff;border:1px solid ${C.line};border-radius:22px;padding:34px 32px">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 8px;font-size:12px;line-height:1.6;color:${C.muted};text-align:center">
          <a href="${site}" style="color:${C.sage};text-decoration:none;font-weight:600">${site.replace(/^https?:\/\//, "")}</a>
          &nbsp;·&nbsp;
          <a href="${INSTAGRAM}" style="color:${C.sage};text-decoration:none;font-weight:600">Instagram @narebyadriana</a><br>
          Asesoría Montessori para familias con niños de 0 a 3 años, 100% en línea.<br>
          ¿Tienes dudas? Solo responde a este correo.
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

/* ---------- envío ---------- */

export const sendEmail = async ({ to, subject, html, replyTo, preheader }) => {
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
      html: layout(html, preheader),
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
  return sendEmail({
    to,
    subject,
    replyTo,
    preheader: subject,
    html: `<p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.clay};margin:0 0 10px;font-weight:700">Aviso de la plataforma</p>
      <div style="font-size:15px;line-height:1.65;color:${C.text}">${html}</div>
      ${button(`${siteUrl()}/admin`, "Abrir panel")}
      ${replyTo ? `<p style="font-size:13px;color:${C.muted};margin:0">Si respondes a este correo, le escribes directamente a ${esc(replyTo)}.</p>` : ""}`,
  });
};

/* ---------- correos para familias ---------- */

export const sendWelcomeEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: "Bienvenida a tu espacio Montessori 🌱",
    preheader: "Tu cuenta está lista. Tu primera asesoría de 30 minutos es gratis.",
    html: `${h(`Hola, ${esc(name)}`)}
      ${p("¡Qué gusto que estés aquí! Tu cuenta quedó creada y ya puedes reservar tu asesoría en línea.")}
      ${p("Así empezamos:")}
      ${list([
        "<b>Completa el perfil de tu familia</b>: la edad de tu hijo, sus intereses y lo que más te preocupa hoy. Con eso preparo la sesión.",
        "<b>Elige día y hora</b> en el calendario. Verás los horarios en hora de Japón y también en tu hora local.",
        "<b>Después de cada sesión</b> recibes tus notas con observaciones y los cambios prioritarios para aplicar en casa.",
      ])}
      ${note("🎁 Si es tu primera vez, tu primera asesoría de <b>30 minutos es gratis</b>.")}
      ${button(`${siteUrl()}/citas/nueva`, "Reservar mi asesoría")}
      ${p("Recuerda: no se trata de hacerlo perfecto, sino de encontrar lo que funciona para tu familia. Aquí te acompaño.")}
      ${signature()}`,
  });

export const sendAppointmentRequestedEmail = (email, name, date, serviceType) =>
  sendEmail({
    to: email,
    subject: "Recibí tu solicitud de asesoría",
    preheader: `Tu solicitud para el ${date} está registrada.`,
    html: `${h(`Gracias, ${esc(name)}`)}
      ${p("Recibí tu solicitud de asesoría. Estos son los detalles:")}
      ${details([
        ["Fecha y hora", esc(date)],
        ["Tema", esc(serviceType)],
        ["Modalidad", "Videollamada en línea"],
      ])}
      ${p("<b>¿Qué sigue?</b>")}
      ${list([
        "Revisaré tu solicitud y te confirmaré por correo con el enlace de la videollamada.",
        "Si aún no lo haces, completa el <b>perfil de tu familia</b>: me ayuda a llegar a la sesión conociendo a tu hijo.",
        "Puedes cancelar o reprogramar sin costo hasta <b>24 horas antes</b>.",
      ])}
      ${button(`${siteUrl()}/citas`, "Ver mis citas")}
      ${signature()}`,
  });

export const sendAppointmentConfirmedEmail = (email, name, date, meetingLink) =>
  sendEmail({
    to: email,
    subject: "Tu asesoría está confirmada ✓",
    preheader: `Nos vemos el ${date}.`,
    html: `${h(`¡Nos vemos pronto, ${esc(name)}!`)}
      ${p("Tu asesoría quedó confirmada:")}
      ${details([
        ["Fecha y hora", esc(date)],
        ["Modalidad", "Videollamada en línea"],
      ])}
      ${meetingLink
        ? button(meetingLink, "Unirme a la videollamada")
        : note("Te enviaré el enlace de la videollamada antes de la sesión.")}
      ${p("<b>Para aprovechar mejor la sesión:</b>")}
      ${list([
        "Busca un lugar tranquilo con buena conexión; si puedes, que tu hijo esté cerca o dormido, como te resulte más cómodo.",
        "Anota 2 o 3 situaciones concretas de esta semana (qué pasó, cuándo y cómo reaccionaron).",
        "Si quieres, toma fotos de los espacios de tu casa que te gustaría mejorar.",
      ])}
      ${p("Si necesitas reprogramar, avísame con al menos 24 horas de anticipación respondiendo a este correo.")}
      ${signature()}`,
  });

export const sendSessionNotePublishedEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: "Tu nota de sesión ya está disponible",
    preheader: "Observaciones y cambios prioritarios para aplicar en casa.",
    html: `${h(`Hola, ${esc(name)}`)}
      ${p("Ya publiqué la nota de nuestra sesión, con mis observaciones y los <b>cambios prioritarios</b> para aplicar en casa.")}
      ${p("Te sugiero leerla con calma y elegir uno o dos cambios para empezar esta semana. Los cambios pequeños y constantes son los que más se notan.")}
      ${button(`${siteUrl()}/sesiones`, "Leer mi nota de sesión")}
      ${p("Si te surge alguna duda al ponerlo en práctica, puedes responder a este correo o agendar una sesión de seguimiento.")}
      ${signature()}`,
  });

export const sendGuideRequestedEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: "Tu guía: 25 cambios Montessori en casa 🌿",
    preheader: "Mientras te la envío, aquí tienes 3 ideas para empezar hoy.",
    html: `${h(`¡Gracias, ${esc(name)}!`)}
      ${p("Recibí tu solicitud de la guía <b>“25 cambios Montessori que puedes hacer en casa sin comprar materiales caros”</b>. Te la enviaré muy pronto a este correo.")}
      ${p("Mientras tanto, aquí tienes <b>3 ideas que puedes aplicar hoy mismo</b>:")}
      ${list([
        "<b>Un banquito en el lavabo.</b> Si alcanza solo, puede lavarse las manos y los dientes con más independencia.",
        "<b>Menos juguetes, más a la vista.</b> Deja 6 u 8 en una repisa baja y guarda el resto; rota cada semana. Verás más concentración.",
        "<b>Un gancho a su altura.</b> Para su abrigo o su mochila: le das un lugar propio y una pequeña responsabilidad.",
      ])}
      ${note("🎁 ¿Quieres llevarlo a tu casa y a tu hijo? Tu primera asesoría de <b>30 minutos es gratis</b>.")}
      ${button(`${siteUrl()}/registro`, "Agendar mi sesión gratis")}
      ${p(`También comparto ideas en Instagram: <a href="${INSTAGRAM}" style="color:${C.sage};font-weight:600">@narebyadriana</a>.`)}
      ${signature()}`,
  });
