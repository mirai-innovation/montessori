import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  esc,
  notifyAdmin,
  sendAppointmentRequestedEmail,
} from "../config/email.js";
import { formatMxn } from "../utils/revenue.js";
import {
  combineDateAndTime,
  formatAppointmentDate,
  getAvailableSlotsForDate,
} from "../utils/availability.js";
import { bookingPlans, servicePlans, getServicePlan, isPaidPlan } from "../../shared/content.js";

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Planes anteriores (solo para completar pagos que se iniciaron antes del cambio de catálogo)
const LEGACY_META = {
  single: { name: "1 sesión", credits: 1, amountCents: 85000 },
  pack4: { name: "Paquete 4 sesiones", credits: 4, amountCents: 299000 },
};

function planMeta(packageId) {
  return getServicePlan(packageId) || LEGACY_META[packageId] || null;
}

function lineItem(plan) {
  return {
    quantity: 1,
    price_data: {
      currency: "mxn",
      unit_amount: plan.amountCents,
      product_data: { name: plan.name, description: plan.desc },
    },
  };
}

router.get("/config", (_req, res) => {
  res.json({
    enabled: !!process.env.STRIPE_SECRET_KEY,
    packages: servicePlans.filter(isPaidPlan),
    bookingPlans,
  });
});

router.post("/checkout", authMiddleware, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ message: "Pagos no configurados aún. Contacta a Adriana para reservar." });
  }
  const { packageId } = req.body;
  const plan = getServicePlan(packageId);
  if (!isPaidPlan(plan)) {
    return res.status(400).json({ message: "Paquete no válido" });
  }
  const user = await User.findById(req.userId);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [lineItem(plan)],
    success_url: `${process.env.FRONTEND_URL}/precios?success=1`,
    cancel_url: `${process.env.FRONTEND_URL}/precios?cancelled=1`,
    metadata: { userId: user._id.toString(), packageId, source: "precios" },
  });
  res.json({ url: session.url });
});

/** Checkout durante reserva: paga y crea cita al completar webhook */
router.post("/booking-checkout", authMiddleware, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ message: "Pagos en línea no disponibles. Elige solicitar sin pago." });
  }
  const { dateKey, time, serviceType, userNotes, packageId } = req.body;
  if (!dateKey || !time || !serviceType || !packageId) {
    return res.status(400).json({ message: "Faltan datos de la reserva" });
  }
  const plan = getServicePlan(packageId);
  if (!isPaidPlan(plan)) {
    return res.status(400).json({ message: "Plan de pago no válido" });
  }
  const slots = await getAvailableSlotsForDate(dateKey);
  if (!slots.includes(time)) {
    return res.status(409).json({ message: "Ese horario ya no está disponible" });
  }
  const user = await User.findById(req.userId);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [lineItem(plan)],
    success_url: `${process.env.FRONTEND_URL}/citas/nueva?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/citas/nueva?cancelled=1`,
    metadata: {
      userId: user._id.toString(),
      packageId,
      source: "booking",
      dateKey,
      time,
      serviceType,
      userNotes: userNotes || "",
    },
  });
  res.json({ url: session.url });
});

router.get("/booking-status", authMiddleware, async (req, res) => {
  const { session_id: sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ message: "session_id requerido" });
  }
  const payment = await Payment.findOne({ stripeSessionId: sessionId, userId: req.userId });
  if (!payment) {
    return res.json({ ready: false });
  }
  const appointment = payment.appointmentId
    ? await Appointment.findById(payment.appointmentId)
    : null;
  res.json({ ready: true, appointment, payment });
});

async function fulfillCheckout(session) {
  const userId = session.metadata?.userId;
  const packageId = session.metadata?.packageId;
  if (!userId || !packageId) return;

  const existing = await Payment.findOne({ stripeSessionId: session.id });
  if (existing) return;

  const meta = planMeta(packageId) || { name: packageId, credits: 1, amountCents: session.amount_total || 0 };
  const amount = session.amount_total || meta.amountCents;
  const source = session.metadata?.source || "precios";

  const payment = await Payment.create({
    userId,
    amount,
    currency: session.currency || "mxn",
    type: "one_time",
    packageId,
    status: "completed",
    stripeSessionId: session.id,
    description: meta.name || packageId,
    paidAt: new Date(),
  });

  if (source === "booking") {
    const { dateKey, time, serviceType, userNotes } = session.metadata;
    const slots = await getAvailableSlotsForDate(dateKey);
    if (!slots.includes(time)) {
      await User.findByIdAndUpdate(userId, { $inc: { sessionCredits: meta.credits } });
      payment.description += " (horario no disponible — créditos acreditados)";
      await payment.save();
      return;
    }
    const scheduledAt = combineDateAndTime(dateKey, time);
    const appointment = await Appointment.create({
      userId,
      scheduledAt,
      serviceType,
      userNotes: userNotes || "",
      status: "solicitada",
      paymentPlan: packageId,
      paidWithCredit: false,
    });
    payment.appointmentId = appointment._id;
    await payment.save();
    await User.findByIdAndUpdate(userId, {
      ...(meta.credits > 1 && { $inc: { sessionCredits: meta.credits - 1 } }),
      activePlan: packageId,
    });
    const user = await User.findById(userId);
    if (user) {
      const when = formatAppointmentDate(scheduledAt, user.timezone);
      const whenAdmin = formatAppointmentDate(scheduledAt, user.timezone, "para la familia");
      await Promise.all([
        sendAppointmentRequestedEmail(user.email, user.name, when, serviceType),
        notifyAdmin({
          subject: `Cita pagada: ${user.name} · ${formatAppointmentDate(scheduledAt)}`,
          html: `<p><b>${esc(user.name)}</b> (${esc(user.email)}) pagó <b>${esc(meta.name)}</b> (${formatMxn(amount)}) y reservó para el <b>${esc(whenAdmin)}</b>.</p>
            <p>Tema: ${esc(serviceType)}</p>${userNotes ? `<p>Notas: ${esc(userNotes)}</p>` : ""}`,
          replyTo: user.email,
        }),
      ]);
    }
  } else {
    await User.findByIdAndUpdate(userId, {
      $inc: { sessionCredits: meta.credits },
      activePlan: packageId,
    });
    const user = await User.findById(userId);
    await notifyAdmin({
      subject: `Compra: ${meta.name} · ${user?.name || "familia"}`,
      html: `<p><b>${esc(user?.name)}</b> (${esc(user?.email)}) compró <b>${esc(meta.name)}</b> (${formatMxn(amount)}) y tiene ${meta.credits} crédito(s) para reservar.</p>`,
      replyTo: user?.email,
    });
  }
}

router.post("/webhook", async (req, res) => {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send("Stripe no configurado");
  }
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    await fulfillCheckout(event.data.object);
  }
  res.json({ received: true });
});

export default router;
