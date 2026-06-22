export const services = [
  { t: "Ambiente preparado en casa", d: "Organizamos recámara, baño, cocina, comedor y juego para favorecer independencia, orden y concentración.", i: '<path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/>' },
  { t: "Independencia y vida práctica", d: "Vestirse, comer solo, recoger, cocinar o cuidar plantas: ayudar al niño a hacer más por sí mismo, paso a paso.", i: '<path d="M9 11V6a3 3 0 0 1 6 0v5M5 11h14l-1 9H6l-1-9z"/>' },
  { t: "Rutinas y límites respetuosos", d: "Rutinas claras para mañanas, comidas, baño y sueño, con límites firmes y amorosos, sin premios ni castigos.", i: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
  { t: "Desarrollo emocional", d: "Berrinches, llanto, apego o frustración: entender la necesidad detrás y responder con calma y seguridad.", i: '<path d="M12 21s-8-4.5-8-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-8 10-8 10z"/>' },
  { t: "Desarrollo social", d: "Compartir, turnos, resolver conflictos, integrarse a grupos o convivir con hermanos, respetando su etapa.", i: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 20c0-2 2-3.5 4-3.5"/>' },
  { t: "Lenguaje y comunicación", d: "Vocabulario, lectura, canciones y escucha activa. Ideal también para familias bilingües o trilingües.", i: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>' },
  { t: "Movimiento y desarrollo motor", d: "Equilibrio, coordinación, motricidad fina y actividades de movimiento seguras según el ritmo del niño.", i: '<circle cx="13" cy="5" r="2"/><path d="M5 21l4-6 3 2 2 5M9 15l-1-5 5-1 3 3"/>' },
  { t: "Adaptación a escuela y cambios", d: "Entrada a la escuela, mudanzas, viajes, llegada de un hermano o regreso a otro país, con seguridad emocional.", i: '<path d="M3 12h13M12 5l7 7-7 7M3 19V5"/>' },
];

export const quotes = [
  { q: "Mi hijo no me hace caso", a: "Solemos traducirlo a algo más profundo: falta de rutina, exceso de estímulo, instrucciones poco claras, cansancio o búsqueda de conexión." },
  { q: "Hace muchos berrinches", a: "Trabajamos desarrollo emocional, anticipación, validación y cómo acompañar sin ceder ni castigar." },
  { q: "No quiere compartir", a: "Compartir no siempre es natural antes de cierta madurez social. Enseñamos turnos, modelaje y respeto por su trabajo." },
  { q: "No quiere vestirse, comer o dormir", a: "Ajustamos rutinas, ambiente y opciones limitadas para reducir luchas de poder y ganar independencia gradual." },
  { q: "Quiere que yo haga todo por él", a: "Observamos si el ambiente permite independencia o si el adulto interviene demasiado rápido." },
  { q: "No se concentra", a: "Revisamos exceso de juguetes, pantallas, falta de orden, interrupciones o necesidad de movimiento." },
  { q: "Se frustra muy rápido", a: "Permitimos el error, no rescatamos de inmediato y preparamos actividades con el reto adecuado." },
  { q: "Pega, muerde o empuja", a: "Trabajamos lenguaje, límites físicos claros, prevención y reparación sin humillación." },
  { q: "Está muy pegado a mamá", a: "Entendemos la necesidad de seguridad y fomentamos independencia con separación gradual, sin romper el vínculo." },
  { q: "Quiero aplicar Montessori y no sé por dónde empezar", a: "Aterrizamos Montessori en tu vida real: sin comprar de más y sin tener que hacerlo perfecto." },
];

export const slotTimes = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

/** Ordena horarios HH:mm y une listas sin duplicados */
export function mergeSlotTimes(...lists) {
  const set = new Set();
  for (const list of lists) {
    for (const t of list || []) {
      if (t) set.add(t);
    }
  }
  return [...set].sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
}

export function formatSlotTime(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const serviceTypes = [
  "Quiero orientación general / no sé por dónde empezar",
  ...services.map((s) => s.t),
];

export const sessionNoteTemplates = [
  { id: "observacion", label: "Observación Montessori", placeholder: "¿Qué observaste en el niño y en el ambiente durante la sesión?" },
  { id: "ambiente", label: "Ambiente preparado", placeholder: "Recomendaciones para recámara, baño, cocina, área de juego..." },
  { id: "rutina", label: "Rutinas y límites", placeholder: "Ajustes sugeridos para mañanas, comidas, baño o sueño..." },
  { id: "emocional", label: "Desarrollo emocional", placeholder: "Cómo acompañar berrinches, frustración o apego..." },
];

export const appointmentStatuses = ["solicitada", "confirmada", "completada", "cancelada", "reprogramada"];

/** Planes de reserva / pago (montos en centavos MXN para Stripe) */
export const bookingPlans = [
  {
    id: "credit",
    name: "Usar mi crédito",
    mode: "1 sesión de tu paquete",
    priceLabel: "Gratis",
    amountCents: 0,
    usesCredit: true,
  },
  {
    id: "single",
    name: "Sesión única",
    mode: "Pago único",
    priceLabel: "$850",
    amountCents: 85000,
    stripePackage: "single",
    credits: 1,
  },
  {
    id: "pack4",
    name: "Paquete de 4",
    mode: "3 MSI disponibles",
    priceLabel: "$2,990",
    amountCents: 299000,
    stripePackage: "pack4",
    credits: 4,
  },
  {
    id: "request",
    name: "Solicitar sin pago en línea",
    mode: "Adriana confirma por correo",
    priceLabel: "—",
    amountCents: 0,
    requestOnly: true,
  },
];

export const planLabels = {
  none: "Sin plan",
  single: "Sesión única",
  pack4: "Paquete 4 sesiones",
  accompany: "Acompañamiento",
  membership: "Membresía",
  credit: "Crédito",
  request: "Solicitud",
};
