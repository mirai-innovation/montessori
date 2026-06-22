import express from "express";
import bcrypt from "bcryptjs";
import Appointment from "../models/Appointment.js";
import ChildProfile from "../models/ChildProfile.js";
import SessionNote from "../models/SessionNote.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  formatAppointmentDate,
  getOrCreateAvailability,
  parseDateKey,
} from "../utils/availability.js";
import { getRevenueStats, getRevenueSummary, childAgeLabel, daysSince } from "../utils/revenue.js";
import { planLabels, slotTimes, mergeSlotTimes, formatSlotTime } from "../../shared/content.js";
import {
  sendAppointmentConfirmedEmail,
  sendSessionNotePublishedEmail,
} from "../config/email.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

function todayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function weekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** Panel general: una sola respuesta optimizada */
router.get("/dashboard", async (_req, res) => {
  try {
    const { start: startOfToday, end: endOfToday } = todayRange();
    const { start: startOfWeek, end: endOfWeek } = weekRange();
    const inactiveCutoff = new Date();
    inactiveCutoff.setDate(inactiveCutoff.getDate() - 21);

    const [
      pending,
      todayCount,
      weekCount,
      activeFamilies,
      totalAppointments,
      cancelled,
      revenue,
      todayAppointments,
      atRiskFromApts,
      inactiveNewUsers,
    ] = await Promise.all([
      Appointment.countDocuments({ status: "solicitada" }),
      Appointment.countDocuments({
        scheduledAt: { $gte: startOfToday, $lte: endOfToday },
        status: { $in: ["solicitada", "confirmada"] },
      }),
      Appointment.countDocuments({
        scheduledAt: { $gte: startOfWeek, $lte: endOfWeek },
        status: { $in: ["solicitada", "confirmada", "completada"] },
      }),
      User.countDocuments({ role: "user", isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "cancelada" }),
      getRevenueSummary(),
      Appointment.find({
        scheduledAt: { $gte: startOfToday, $lte: endOfToday },
        status: { $in: ["solicitada", "confirmada"] },
      })
        .populate("userId", "name")
        .sort({ scheduledAt: 1 })
        .limit(4)
        .lean(),
      Appointment.aggregate([
        { $sort: { scheduledAt: -1 } },
        { $group: { _id: "$userId", lastAt: { $first: "$scheduledAt" } } },
        { $match: { lastAt: { $lte: inactiveCutoff } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $match: { "user.role": "user", "user.isActive": true } },
        {
          $project: {
            _id: "$user._id",
            name: "$user.name",
            lastAt: 1,
          },
        },
        { $limit: 5 },
      ]),
      User.find({
        role: "user",
        isActive: true,
        createdAt: { $lte: inactiveCutoff },
      })
        .select("name createdAt")
        .limit(20)
        .lean(),
    ]);

    const aptIds = new Set(atRiskFromApts.map((r) => r._id.toString()));

    const newUserAtRisk = [];
    if (inactiveNewUsers.length) {
      const neverBooked = await Appointment.distinct("userId", {
        userId: { $in: inactiveNewUsers.map((u) => u._id) },
      });
      const bookedSet = new Set(neverBooked.map((id) => id.toString()));
      for (const u of inactiveNewUsers) {
        if (!bookedSet.has(u._id.toString()) && !aptIds.has(u._id.toString())) {
          newUserAtRisk.push({
            _id: u._id,
            name: u.name,
            inactiveDays: daysSince(u.createdAt),
          });
        }
      }
    }

    const atRisk = [
      ...atRiskFromApts.map((r) => ({
        _id: r._id,
        name: r.name,
        inactiveDays: daysSince(r.lastAt),
      })),
      ...newUserAtRisk,
    ]
      .sort((a, b) => b.inactiveDays - a.inactiveDays)
      .slice(0, 3);

    res.json({
      stats: {
        pending,
        todayCount,
        weekCount,
        activeFamilies,
        cancelRate: totalAppointments ? Math.round((cancelled / totalAppointments) * 100) : 0,
        monthRevenue: revenue.monthRevenue,
        monthGrowth: revenue.monthGrowth,
      },
      todayAppointments,
      atRisk,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cargar el panel" });
  }
});

router.get("/stats", async (_req, res) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const [pending, todayCount, weekCount, activeFamilies, totalAppointments, cancelled, revenue, serviceStats] = await Promise.all([
    Appointment.countDocuments({ status: "solicitada" }),
    Appointment.countDocuments({
      scheduledAt: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ["solicitada", "confirmada"] },
    }),
    Appointment.countDocuments({
      scheduledAt: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $in: ["solicitada", "confirmada", "completada"] },
    }),
    User.countDocuments({ role: "user", isActive: true }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: "cancelada" }),
    getRevenueSummary(),
    Appointment.aggregate([
      { $group: { _id: "$serviceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.json({
    stats: {
      pending,
      todayCount,
      weekCount,
      activeFamilies,
      totalAppointments,
      cancelRate: totalAppointments ? Math.round((cancelled / totalAppointments) * 100) : 0,
      topServices: serviceStats,
      monthRevenue: revenue.monthRevenue,
      monthGrowth: revenue.monthGrowth,
    },
  });
});

router.get("/revenue", async (_req, res) => {
  const revenue = await getRevenueStats();
  const recent = await Payment.find({ status: "completed" })
    .populate("userId", "name email")
    .sort({ paidAt: -1 })
    .limit(20);
  res.json({ revenue, recentPayments: recent });
});

router.get("/agenda/week", async (req, res) => {
  const startParam = req.query.start;
  let weekStart;
  if (startParam) {
    const [y, m, d] = startParam.split("-").map(Number);
    weekStart = new Date(y, m - 1, d);
  } else {
    const now = new Date();
    weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diff);
  }
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const availability = await getOrCreateAvailability();
  const weeklySlots = {};
  const slots = availability.weeklySlots;
  if (slots instanceof Map) {
    for (const [k, v] of slots.entries()) weeklySlots[k] = v;
  } else {
    Object.assign(weeklySlots, slots);
  }

  const appointments = await Appointment.find({
    scheduledAt: { $gte: weekStart, $lte: weekEnd },
    status: { $in: ["solicitada", "confirmada", "completada", "reprogramada"] },
  })
    .populate("userId", "name email")
    .sort({ scheduledAt: 1 });

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key = parseDateKey(d);
    const dow = String(d.getDay());
    days.push({
      dateKey: key,
      dayOfWeek: d.getDay(),
      label: d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
      slots: weeklySlots[dow] || [],
      blocked: availability.blockedDates.includes(key),
    });
  }

  const appointmentTimes = appointments.map((a) => formatSlotTime(a.scheduledAt));
  const configuredTimes = Object.values(weeklySlots).flat();
  const allSlotTimes = mergeSlotTimes(configuredTimes, appointmentTimes);
  if (!allSlotTimes.length) allSlotTimes.push(...slotTimes.filter((t) => ["09:00", "10:30", "12:00", "16:00", "17:30"].includes(t)));

  res.json({
    weekStart: parseDateKey(weekStart),
    weekEnd: parseDateKey(weekEnd),
    days,
    appointments,
    slotTimes: allSlotTimes,
  });
});

router.get("/appointments", async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const appointments = await Appointment.find(filter)
    .populate("userId", "name email phone")
    .sort({ scheduledAt: -1 });
  res.json({ appointments });
});

router.patch("/appointments/:id", async (req, res) => {
  try {
    const { status, meetingLink, adminNotes, scheduledAt } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate("userId", "name email");
    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    if (status) appointment.status = status;
    if (meetingLink !== undefined) appointment.meetingLink = meetingLink;
    if (adminNotes !== undefined) appointment.adminNotes = adminNotes;
    if (scheduledAt) appointment.scheduledAt = new Date(scheduledAt);
    await appointment.save();

    if (status === "confirmada" && appointment.userId) {
      await sendAppointmentConfirmedEmail(
        appointment.userId.email,
        appointment.userId.name,
        formatAppointmentDate(appointment.scheduledAt),
        appointment.meetingLink
      );
    }
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar cita" });
  }
});

router.get("/availability", async (_req, res) => {
  const availability = await getOrCreateAvailability();
  const weeklySlots = {};
  const slots = availability.weeklySlots;
  if (slots instanceof Map) {
    for (const [k, v] of slots.entries()) weeklySlots[k] = v;
  } else {
    Object.assign(weeklySlots, slots);
  }
  res.json({
    weeklySlots,
    blockedDates: availability.blockedDates,
    slotDurationMinutes: availability.slotDurationMinutes,
  });
});

router.put("/availability", async (req, res) => {
  try {
    const availability = await getOrCreateAvailability();
    if (req.body.weeklySlots) {
      availability.weeklySlots = new Map(Object.entries(req.body.weeklySlots));
    }
    if (req.body.blockedDates) {
      availability.blockedDates = req.body.blockedDates;
    }
    if (req.body.slotDurationMinutes) {
      availability.slotDurationMinutes = req.body.slotDurationMinutes;
    }
    await availability.save();
    res.json({ availability });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar disponibilidad" });
  }
});

router.get("/users", async (req, res) => {
  const filter = { role: "user" };
  if (req.query.q) {
    filter.$or = [
      { name: { $regex: req.query.q, $options: "i" } },
      { email: { $regex: req.query.q, $options: "i" } },
    ];
  }
  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  const userIds = users.map((u) => u._id);
  const [profiles, lastApts] = await Promise.all([
    ChildProfile.find({ userId: { $in: userIds } }),
    Appointment.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $sort: { scheduledAt: -1 } },
      {
        $group: {
          _id: "$userId",
          lastAt: { $first: "$scheduledAt" },
          lastStatus: { $first: "$status" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);
  const profileMap = Object.fromEntries(profiles.map((p) => [p.userId.toString(), p]));
  const aptMap = Object.fromEntries(lastApts.map((a) => [a._id.toString(), a]));

  const enriched = users.map((u) => {
    const prof = profileMap[u._id.toString()];
    const apt = aptMap[u._id.toString()];
    const inactiveDays = apt ? daysSince(apt.lastAt) : daysSince(u.createdAt);
    const atRisk = inactiveDays !== null && inactiveDays >= 21;
    const planKey = u.activePlan && u.activePlan !== "none" ? u.activePlan : u.sessionCredits > 0 ? "pack4" : "none";
    return {
      ...u.toObject(),
      childName: prof?.childName || "",
      childAge: childAgeLabel(prof?.birthDate),
      planLabel: planLabels[planKey] || planLabels.none,
      lastSessionAt: apt?.lastAt || null,
      sessionCount: apt?.count || 0,
      inactiveDays,
      atRisk,
    };
  });
  res.json({ users: enriched });
});

router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  const [profile, appointments, notes, payments] = await Promise.all([
    ChildProfile.findOne({ userId: user._id }),
    Appointment.find({ userId: user._id }).sort({ scheduledAt: -1 }),
    SessionNote.find({ userId: user._id }).sort({ createdAt: -1 }),
    Payment.find({ userId: user._id, status: "completed" }).sort({ paidAt: -1 }),
  ]);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const planKey = user.activePlan && user.activePlan !== "none" ? user.activePlan : user.sessionCredits > 0 ? "pack4" : "none";
  res.json({
    user,
    profile,
    appointments,
    notes,
    payments,
    totalPaid,
    planLabel: planLabels[planKey] || planLabels.none,
    childAge: childAgeLabel(profile?.birthDate),
  });
});

router.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const { isActive, adminNotes, sessionCredits } = req.body;
    if (isActive !== undefined) user.isActive = isActive;
    if (adminNotes !== undefined) user.adminNotes = adminNotes;
    if (sessionCredits !== undefined) user.sessionCredits = sessionCredits;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive, adminNotes: user.adminNotes, sessionCredits: user.sessionCredits } });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

router.get("/session-notes/appointment/:appointmentId", async (req, res) => {
  const note = await SessionNote.findOne({ appointmentId: req.params.appointmentId });
  res.json({ note });
});

router.post("/session-notes", async (req, res) => {
  try {
    const {
      appointmentId,
      summary,
      observations,
      recommendations,
      resources,
      nextSteps,
      publish,
    } = req.body;
    const appointment = await Appointment.findById(appointmentId).populate("userId", "name email");
    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    const note = await SessionNote.findOneAndUpdate(
      { appointmentId },
      {
        userId: appointment.userId._id,
        summary,
        observations,
        recommendations,
        resources,
        nextSteps,
        isPublished: !!publish,
        publishedAt: publish ? new Date() : undefined,
      },
      { upsert: true, new: true }
    );
    if (publish) {
      if (appointment.status !== "completada") {
        appointment.status = "completada";
        await appointment.save();
      }
      await sendSessionNotePublishedEmail(appointment.userId.email, appointment.userId.name);
    }
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar nota" });
  }
});

export default router;
