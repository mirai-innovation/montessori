/**
 * La agenda de Adriana vive en hora de Japón. Todas las fechas "de calendario"
 * (dateKey "YYYY-MM-DD" y horarios "HH:mm") se interpretan en esta zona,
 * sin importar dónde corra el servidor (Vercel usa UTC) ni dónde esté la familia.
 */
export const BUSINESS_TZ = "Asia/Tokyo";
export const BUSINESS_TZ_LABEL = "hora de Japón";
const OFFSET = "+09:00"; // Japón no tiene horario de verano
const OFFSET_MS = 9 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, "0");

/** Componentes de una fecha vista en hora de Japón */
export function tokyoParts(date) {
  const t = new Date(new Date(date).getTime() + OFFSET_MS);
  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth() + 1,
    day: t.getUTCDate(),
    dow: t.getUTCDay(),
    hours: t.getUTCHours(),
    minutes: t.getUTCMinutes(),
  };
}

export function tokyoDateKey(date) {
  const p = tokyoParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function tokyoTime(date) {
  const p = tokyoParts(date);
  return `${pad(p.hours)}:${pad(p.minutes)}`;
}

/** Instante real que corresponde a un día y hora en Japón */
export function fromTokyo(dateKey, time = "00:00") {
  return new Date(`${dateKey}T${time}:00${OFFSET}`);
}

/** Suma días a un dateKey (aritmética de calendario, sin zona horaria) */
export function addDays(dateKey, n) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Día de la semana de un dateKey (0 = domingo) */
export function dayOfWeek(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Lunes de la semana (en Japón) que contiene a `date` */
export function tokyoWeekStart(date = new Date()) {
  const key = tokyoDateKey(date);
  return addDays(key, -((dayOfWeek(key) + 6) % 7));
}

/** Texto en español de una fecha en cualquier zona; sin `timeZone` usa la del navegador/servidor */
export function formatInZone(date, timeZone, options) {
  return new Intl.DateTimeFormat("es-MX", { timeZone, ...options }).format(new Date(date));
}

const LONG = { day: "numeric", month: "long", year: "numeric" };
const TIME = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" };

/** "1 de mayo de 2026, 10:00" en la zona indicada */
export function formatLong(date, timeZone) {
  return `${formatInZone(date, timeZone, LONG)}, ${formatInZone(date, timeZone, TIME)}`;
}

/**
 * Fecha de una cita para mostrar a familias: hora de Japón y, si la familia está en otra zona,
 * también su hora local. Ej: "1 de mayo de 2026, 10:00 (hora de Japón) · 30 de abril de 2026, 19:00 en tu zona"
 */
export function formatAppointmentBoth(date, familyTz, zoneLabel = "en tu zona") {
  const japan = `${formatLong(date, BUSINESS_TZ)} (${BUSINESS_TZ_LABEL})`;
  if (!familyTz || familyTz === BUSINESS_TZ) return japan;
  try {
    return `${japan} · ${formatLong(date, familyTz)} ${zoneLabel}`;
  } catch {
    return japan;
  }
}
