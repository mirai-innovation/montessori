import { tokyoTime } from "./time.js";

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

/** Horario "HH:mm" de una cita en hora de Japón (la zona de la agenda) */
export function formatSlotTime(date) {
  return tokyoTime(date);
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

/**
 * Catálogo de asesorías. Lo usan el landing, /precios, la reserva y Stripe.
 * Montos en centavos MXN; Stripe Checkout los cobra con price_data (no hace falta crear precios en Stripe).
 * - firstTimeOnly: solo para familias sin citas previas (se valida en el servidor).
 * - requestOnly: sin pago en línea; Adriana confirma el precio por correo.
 */
export const servicePlans = [
  {
    id: "free30",
    name: "Primera asesoría gratis",
    desc: "30 minutos para conocernos y darte una primera orientación. Incluye cuestionario previo.",
    priceLabel: "Gratis",
    amountCents: 0,
    credits: 1,
    firstTimeOnly: true,
  },
  { id: "sos", name: "Consulta SOS", desc: "30 minutos para una dificultad específica.", priceLabel: "$690 MXN", amountCents: 69000, credits: 1 },
  { id: "personal", name: "Asesoría personalizada", desc: "Cuestionario + 60 min + recomendaciones.", priceLabel: "$1,290 MXN", amountCents: 129000, credits: 1, featured: true },
  { id: "plan", name: "Asesoría con plan", desc: "90 minutos + plan escrito para tu familia.", priceLabel: "$2,200 MXN", amountCents: 220000, credits: 1 },
  { id: "followup", name: "Seguimiento", desc: "Paquete de tres sesiones para sostener los cambios.", priceLabel: "$3,500 MXN", amountCents: 350000, credits: 3 },
  { id: "home", name: "Montessori en casa", desc: "Evaluación integral del ambiente familiar.", priceLabel: "$3,900 MXN", amountCents: 390000, credits: 1 },
  { id: "intl", name: "Internacional", desc: "Para familias fuera de México. Adriana confirma el precio por correo.", priceLabel: "US$95–125", amountCents: 0, credits: 1, requestOnly: true },
];

export const launchOffer = "Lanzamiento: 10 asesorías fundadoras a $1,290 MXN";

export function getServicePlan(id) {
  return servicePlans.find((p) => p.id === id) || null;
}

/** Plan con cobro en línea vía Stripe */
export function isPaidPlan(plan) {
  return !!plan && plan.amountCents > 0 && !plan.requestOnly;
}

/** Opciones del paso "Plan" al reservar */
export const bookingPlans = [
  { id: "credit", name: "Usar mi crédito", desc: "1 sesión de tu paquete", priceLabel: "Sin costo", amountCents: 0 },
  ...servicePlans,
  { id: "request", name: "Solicitar sin pago en línea", desc: "Adriana confirma por correo", priceLabel: "—", amountCents: 0, requestOnly: true },
];

export const planLabels = {
  none: "Sin plan",
  credit: "Crédito",
  request: "Solicitud",
  ...Object.fromEntries(servicePlans.map((p) => [p.id, p.name])),
  // planes anteriores
  single: "Sesión única",
  pack4: "Paquete 4 sesiones",
  accompany: "Acompañamiento",
  membership: "Membresía",
};

export const testimonials = [
  { text: "No dormía sin brazos y las noches eran agotadoras. Ajustamos el ambiente y la rutina, y ahora concilia el sueño con mucha más calma.", who: "M. G. · bebé de 14 meses" },
  { text: "Había berrinches en cada comida. Trabajamos autonomía y límites respetuosos, y las comidas se volvieron momentos tranquilos.", who: "L. R. · niño de 2 años" },
  { text: "La casa era un caos y nadie participaba. Preparamos el ambiente en un espacio pequeño y ahora colaboran por sí solos.", who: "J. T. · gemelos de 20 meses" },
];

export const leadTypes = ["guide", "school"];

/**
 * "Mi camino": experiencias, congresos y formaciones de Adriana.
 * Para publicar una nueva entrada basta con agregar un objeto aquí.
 * - `published: false` la oculta del sitio (útil mientras faltan datos o fotos).
 * - Las imágenes viven en client/public/assets/camino/. Si una imagen todavía no existe,
 *   el sitio muestra un marcador visual en su lugar.
 */
export const journeyPosts = [
  {
    slug: "congreso-internacional-montessori-merida-2026",
    published: true,
    title: "De Japón a Mérida: mi primer Congreso Internacional Montessori",
    date: "2026-05",
    dateLabel: "1–4 de mayo de 2026",
    location: "Mérida, Yucatán, México",
    tag: "30° Congreso Internacional Montessori",
    cover: "/assets/gallery-3.jpg",
    coverAlt: "Adriana en el Congreso Internacional Montessori en Mérida",
    excerpt:
      "Viajé de Japón a México por este momento. En mayo asistí a mi primer Congreso Internacional Montessori y tuve la oportunidad de conocer y compartir un momento con Judi Orion.",
    body: [
      { p: "Viajé de Japón a México por este momento. 🇯🇵✈️🇲🇽" },
      { p: "En mayo tuve la oportunidad de asistir en Mérida, Yucatán, a mi primer Congreso Internacional Montessori, un encuentro internacional que reúne a personas de distintas partes del mundo alrededor de una misma visión: acompañar el desarrollo humano desde Montessori." },
      { p: "Y ahí tuve la oportunidad de conocer y compartir un momento con Judi Orion, una de las grandes referentes de Montessori a nivel internacional." },
      { h: "¿Quién es Judi Orion?" },
      { p: "Judi es Directora de Pedagogía de la Association Montessori Internationale (AMI), entrenadora, examinadora y consultora Montessori. Se formó en 3–6 y fue parte de la primera formación AMI de Asistentes a la Infancia 0–3 realizada en Roma. Durante décadas ha formado a generaciones de guías y entrenadores alrededor del mundo." },
      { h: "Por qué fue tan especial" },
      { p: "Para mí fue muy especial poder estar ahí. Estaba viviendo en Japón y decidí viajar hasta Mérida para asistir a este Congreso. Más allá de las horas de vuelo o de la distancia, sabía que quería vivirlo." },
      { p: "Porque cuando algo realmente te importa, empiezas a entender que formarte también significa acercarte a las personas que han dedicado su vida a aquello que tú apenas estás comenzando a construir." },
      { p: "Poder escucharla, conocerla y compartir aunque fueran unos minutos con ella fue uno de esos momentos que guardas." },
      { h: "Mi camino con Montessori" },
      { p: "Hace algunos años Montessori llegó a mi vida como mamá. Después decidí estudiarlo. Hoy sigo aprendiendo de personas que han dedicado prácticamente toda su trayectoria profesional a comprender y defender el desarrollo del niño." },
      { p: "Y mientras estaba ahí pensé: qué increíble poder estar sentada frente a personas que ayudaron a construir el camino que hoy nosotros tenemos la oportunidad de continuar." },
      { p: "Japón → Mérida. Mi primer Congreso Internacional Montessori. Y un recuerdo que definitivamente quería guardar aquí. 🤍" },
    ],
    gallery: [
      { src: "/assets/camino/merida-judi-orion.jpg", alt: "Adriana con Judi Orion" },
      { src: "/assets/camino/merida-escenario.jpg", alt: "Escenario del Congreso Internacional Montessori" },
      { src: "/assets/camino/merida-recinto.jpg", alt: "Recinto del Congreso en Mérida" },
      { src: "/assets/cred-2.jpg", alt: "Constancia del 30° Congreso Internacional Montessori \"Joyful Journey\" (28 horas)" },
    ],
  },
  {
    // Pendiente: faltan nombre del evento, fecha, ciudad, recinto, ponente, tema, aprendizajes y fotos.
    slug: "conferencia-japon",
    published: false,
    title: "Conferencia en Japón",
    date: "",
    dateLabel: "",
    location: "Japón",
    tag: "Conferencia",
    cover: "/assets/camino/japon-portada.jpg",
    coverAlt: "Adriana en una conferencia en Japón",
    excerpt: "",
    body: [],
    gallery: [],
  },
];
