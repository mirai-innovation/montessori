import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import {
  dayOfWeek,
  formatAppointmentBoth,
  fromTokyo,
  tokyoDateKey,
  tokyoTime,
} from "../../shared/time.js";

// Todas las fechas de agenda (dateKey y horarios) están en hora de Japón: ver shared/time.js

export async function getOrCreateAvailability() {
  let availability = await Availability.findOne();
  if (!availability) {
    availability = await Availability.create({});
  }
  return availability;
}

export function parseDateKey(date) {
  return tokyoDateKey(date);
}

export function combineDateAndTime(dateKey, time) {
  return fromTokyo(dateKey, time);
}

const pad = (n) => String(n).padStart(2, "0");

export async function getBookedSlotsForMonth(year, month) {
  const firstKey = `${year}-${pad(month)}-01`;
  const nextKey = month === 12 ? `${year + 1}-01-01` : `${year}-${pad(month + 1)}-01`;
  const appointments = await Appointment.find({
    scheduledAt: { $gte: fromTokyo(firstKey), $lt: fromTokyo(nextKey) },
    status: { $in: ["solicitada", "confirmada", "completada", "reprogramada"] },
  });
  const booked = {};
  for (const apt of appointments) {
    const key = tokyoDateKey(apt.scheduledAt);
    if (!booked[key]) booked[key] = [];
    booked[key].push(tokyoTime(apt.scheduledAt));
  }
  return booked;
}

function getWeeklyDaySlots(weeklySlots, dayOfWeek) {
  const dayKey = String(dayOfWeek);
  return (typeof weeklySlots.get === "function" ? weeklySlots.get(dayKey) : weeklySlots[dayKey]) || [];
}

function slotsForDateKey(dateKey, availability, booked) {
  if (availability.blockedDates.includes(dateKey)) return [];

  const dow = dayOfWeek(dateKey);
  if (dow === 0) return [];

  const now = new Date();
  const todayKey = tokyoDateKey(now);
  if (dateKey < todayKey) return [];

  const daySlots = getWeeklyDaySlots(availability.weeklySlots, dow);
  const taken = booked[dateKey] || [];
  return daySlots.filter((slot) => !taken.includes(slot) && fromTokyo(dateKey, slot) > now);
}

/** Una sola lectura de agenda + citas del mes (evita N consultas por día). */
export async function getAvailableDaysForMonth(year, month) {
  const availability = await getOrCreateAvailability();
  const booked = await getBookedSlotsForMonth(year, month);
  const daysInMonth = new Date(year, month, 0).getDate();
  const availableDays = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const slots = slotsForDateKey(dateKey, availability, booked);
    if (slots.length) availableDays[dateKey] = slots;
  }

  return { availableDays, booked, blockedDates: availability.blockedDates };
}

export async function getAvailableSlotsForDate(dateKey) {
  const availability = await getOrCreateAvailability();
  const [y, m] = dateKey.split("-").map(Number);
  const booked = await getBookedSlotsForMonth(y, m);
  return slotsForDateKey(dateKey, availability, booked);
}

/** Fecha de cita para correos: hora de Japón y, si se da, también la hora de la familia */
export function formatAppointmentDate(date, familyTz, zoneLabel) {
  return formatAppointmentBoth(date, familyTz, zoneLabel);
}
