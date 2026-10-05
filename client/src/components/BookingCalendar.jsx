import { useEffect, useState } from "react";
import { monthNames } from "../../../shared/content.js";
import { BUSINESS_TZ, formatInZone, fromTokyo } from "../../../shared/time.js";

const DOW = ["L", "M", "X", "J", "V", "S", "D"];
const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const SHOW_LOCAL = LOCAL_TZ !== BUSINESS_TZ;

/** Hora local de la familia para un horario de la agenda (ej. "19:00 del 4 oct") */
function localLabel(dateKey, slot) {
  const at = fromTokyo(dateKey, slot);
  const time = formatInZone(at, LOCAL_TZ, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const sameDay = formatInZone(at, LOCAL_TZ, { day: "numeric" }) === String(Number(dateKey.slice(8)));
  return sameDay ? time : `${time} del ${formatInZone(at, LOCAL_TZ, { day: "numeric", month: "short" })}`;
}

export function BookingCalendar({ onSelect, selectedDate, selectedSlot, fetchAvailability }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [availableDays, setAvailableDays] = useState({});
  const [loading, setLoading] = useState(false);

  const year = view.getFullYear();
  const month = view.getMonth() + 1;

  useEffect(() => {
    setLoading(true);
    fetchAvailability(year, month)
      .then((data) => setAvailableDays(data.availableDays || {}))
      .catch(() => setAvailableDays({}))
      .finally(() => setLoading(false));
  }, [year, month, fetchAvailability]);

  const daysInMonth = new Date(year, month, 0).getDate();
  let start = new Date(year, month - 1, 1).getDay();
  start = start === 0 ? 6 : start - 1;

  const dateKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null;
  const slots = dateKey ? availableDays[dateKey] || [] : [];

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className={loading ? "cal-loading" : ""}>
      {loading && <p className="cal-loading-msg">Cargando fechas disponibles…</p>}
      <div className="cal">
        <div className="cal-top">
          <h3>{monthNames[month - 1]} {year}</h3>
          <div className="cal-nav">
            <button
              type="button"
              aria-label="Mes anterior"
              disabled={view <= minMonth}
              onClick={() => setView(new Date(year, month - 2, 1))}
            >
              ‹
            </button>
            <button type="button" aria-label="Mes siguiente" onClick={() => setView(new Date(year, month, 1))}>
              ›
            </button>
          </div>
        </div>
        <div className="dow">
          {DOW.map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="days">
          {Array.from({ length: start }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
            const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const date = new Date(year, month - 1, d);
            const hasSlots = (availableDays[key] || []).length > 0;
            const isSel = selectedDate && date.getTime() === selectedDate.getTime();
            const isToday = date.getTime() === today.getTime();
            return (
              <button
                key={d}
                type="button"
                className={`day${isSel ? " sel" : ""}${isToday ? " today" : ""}`}
                disabled={loading || !hasSlots}
                onClick={() => onSelect({ date, dateKey: key, slot: null })}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
      {dateKey && (
        <div style={{ marginTop: 16 }}>
          <p className="hint">
            Horarios disponibles en <b>hora de Japón</b>
            {SHOW_LOCAL && <> · entre paréntesis, tu hora local</>}:
          </p>
          <div className="slots">
            {slots.length === 0 && <span className="hint">Sin horarios este día</span>}
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`slot${selectedSlot === slot ? " sel" : ""}`}
                onClick={() => onSelect({ date: selectedDate, dateKey, slot })}
              >
                {slot}
                {SHOW_LOCAL && <span className="slot-local"> ({localLabel(dateKey, slot)})</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
