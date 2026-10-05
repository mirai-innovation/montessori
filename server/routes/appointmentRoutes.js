import express from "express";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  combineDateAndTime,
  formatAppointmentDate,
  getAvailableDaysForMonth,
  getAvailableSlotsForDate,
  parseDateKey,
} from "../utils/availability.js";
import {
  esc,
  notifyAdmin,
  sendAppointmentRequestedEmail,
} from "../config/email.js";
import { getServicePlan, isPaidPlan, planLabels } from "../../shared/content.js";

const router = express.Router();
const CANCEL_HOURS = 24;

router.get("/availability", authMiddleware, async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    if (!year || !month) {
      return res.status(400).json({ message: "year y month son requeridos" });
    }
    const { availableDays, booked, blockedDates } = await getAvailableDaysForMonth(year, month);

    res.json({
      availableDays,
      booked,
      blockedDates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener disponibilidad" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { dateKey, time, serviceType, userNotes, paymentPlan } = req.body;
    if (!dateKey || !time || !serviceType) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    const slots = await getAvailableSlotsForDate(dateKey);
    if (!slots.includes(time)) {
      return res.status(409).json({ message: "Ese horario ya no está disponible" });
    }
    const scheduledAt = combineDateAndTime(dateKey, time);
    const user = await User.findById(req.userId);

    const plan = getServicePlan(paymentPlan);
    if (isPaidPlan(plan)) {
      return res.status(400).json({ message: "Este plan requiere pago en línea" });
    }
    if (plan?.firstTimeOnly) {
      const previous = await Appointment.exists({ userId: req.userId, status: { $ne: "cancelada" } });
      if (previous) {
        return res.status(400).json({ message: "La asesoría gratuita es solo para tu primera sesión" });
      }
    }

    const useCredit = paymentPlan === "credit";
    if (useCredit) {
      if ((user.sessionCredits || 0) < 1) {
        return res.status(400).json({ message: "No tienes créditos disponibles" });
      }
      user.sessionCredits -= 1;
      await user.save();
    }

    const appointment = await Appointment.create({
      userId: req.userId,
      scheduledAt,
      serviceType,
      userNotes: userNotes || "",
      status: "solicitada",
      paymentPlan: paymentPlan || "request",
      paidWithCredit: useCredit,
    });
    const when = formatAppointmentDate(scheduledAt, user.timezone);
    const whenAdmin = formatAppointmentDate(scheduledAt, user.timezone, "para la familia");
    await Promise.all([
      sendAppointmentRequestedEmail(user.email, user.name, when, serviceType),
      notifyAdmin({
        subject: `Nueva solicitud de cita: ${user.name} · ${formatAppointmentDate(scheduledAt)}`,
        html: `<p><b>${esc(user.name)}</b> (${esc(user.email)}) solicitó una asesoría.</p>
          <p>Fecha: <b>${esc(whenAdmin)}</b><br>Tema: ${esc(serviceType)}<br>Plan: ${esc(planLabels[appointment.paymentPlan] || appointment.paymentPlan)}</p>
          ${userNotes ? `<p>Notas: ${esc(userNotes)}</p>` : ""}
          <p>Confírmala desde el panel para enviarle el enlace.</p>`,
        replyTo: user.email,
      }),
    ]);
    res.status(201).json({ appointment, creditsRemaining: user.sessionCredits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear cita" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const appointments = await Appointment.find({ userId: req.userId }).sort({ scheduledAt: -1 });
  res.json({ appointments });
});

router.get("/upcoming", authMiddleware, async (req, res) => {
  const now = new Date();
  const appointment = await Appointment.findOne({
    userId: req.userId,
    scheduledAt: { $gte: now },
    status: { $in: ["solicitada", "confirmada"] },
  }).sort({ scheduledAt: 1 });
  res.json({ appointment });
});

router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.userId });
    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    if (["cancelada", "completada"].includes(appointment.status)) {
      return res.status(400).json({ message: "Esta cita no puede cancelarse" });
    }
    const hoursUntil = (appointment.scheduledAt - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < CANCEL_HOURS) {
      return res.status(400).json({ message: `Solo puedes cancelar con al menos ${CANCEL_HOURS} horas de anticipación` });
    }
    appointment.status = "cancelada";
    appointment.cancelledAt = new Date();
    appointment.cancelReason = req.body.reason || "";
    await appointment.save();
    const user = await User.findById(req.userId);
    await notifyAdmin({
      subject: `Cita cancelada: ${user?.name || "familia"} · ${formatAppointmentDate(appointment.scheduledAt)}`,
      html: `<p><b>${esc(user?.name)}</b> canceló su cita del <b>${esc(formatAppointmentDate(appointment.scheduledAt))}</b>.</p>
        ${appointment.cancelReason ? `<p>Motivo: ${esc(appointment.cancelReason)}</p>` : ""}`,
      replyTo: user?.email,
    });
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar cita" });
  }
});

export default router;
