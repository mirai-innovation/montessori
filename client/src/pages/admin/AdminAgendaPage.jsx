import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { slotTimes, formatSlotTime } from "../../../../shared/content.js";

const DAYS = [
  { key: "1", label: "Lunes" },
  { key: "2", label: "Martes" },
  { key: "3", label: "Miércoles" },
  { key: "4", label: "Jueves" },
  { key: "5", label: "Viernes" },
  { key: "6", label: "Sábado" },
  { key: "0", label: "Domingo" },
];

function addDays(dateKey, n) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export default function AdminAgendaPage() {
  const [tab, setTab] = useState("week");
  const [weeklySlots, setWeeklySlots] = useState({});
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlocked, setNewBlocked] = useState("");
  const [msg, setMsg] = useState("");
  const [weekData, setWeekData] = useState(null);
  const [weekStart, setWeekStart] = useState(null);

  const loadWeek = (start) => {
    api.adminWeekAgenda(start || undefined).then((d) => {
      setWeekData(d);
      setWeekStart(d.weekStart);
    });
  };

  useEffect(() => {
    api.adminAvailability().then((d) => {
      setWeeklySlots(d.weeklySlots || {});
      setBlockedDates(d.blockedDates || []);
    });
    loadWeek();
  }, []);

  const toggleSlot = (day, slot) => {
    setWeeklySlots((prev) => {
      const current = prev[day] || [];
      const next = current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot].sort();
      return { ...prev, [day]: next };
    });
  };

  const addBlocked = () => {
    if (newBlocked && !blockedDates.includes(newBlocked)) {
      setBlockedDates([...blockedDates, newBlocked].sort());
      setNewBlocked("");
    }
  };

  const save = async () => {
    await api.adminSaveAvailability({ weeklySlots, blockedDates });
    setMsg("Agenda guardada");
    loadWeek(weekStart);
  };

  const times = weekData?.slotTimes?.length
    ? weekData.slotTimes
    : slotTimes;
  const weekDays = weekData?.days || [];

  const aptAt = (dateKey, time) => {
    if (!weekData) return null;
    return weekData.appointments.find((a) => {
      const d = new Date(a.scheduledAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return key === dateKey && formatSlotTime(d) === time;
    });
  };

  const weekLabel = weekDays.length
    ? `${weekDays[0]?.label} – ${weekDays[weekDays.length - 1]?.label}`
    : "Esta semana";

  return (
    <div className="scr">
      <PageHeader
        eyebrow="Agenda"
        title={tab === "week" ? weekLabel : "Disponibilidad"}
        action={
          tab === "week" ? (
            <div className="actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => loadWeek(addDays(weekStart, -7))}>‹ Semana</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => loadWeek()}>Hoy</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => loadWeek(addDays(weekStart, 7))}>Semana ›</button>
            </div>
          ) : null
        }
      />

      <div className="agenda-tabs">
        <button type="button" className={`agenda-tab${tab === "week" ? " active" : ""}`} onClick={() => setTab("week")}>
          Vista semanal
        </button>
        <button type="button" className={`agenda-tab${tab === "slots" ? " active" : ""}`} onClick={() => setTab("slots")}>
          Disponibilidad
        </button>
      </div>

      {tab === "week" && weekData && (
        <div className="panel week-grid-wrap">
          <div className="week-grid">
            <div className="week-grid-corner" />
            {weekDays.map((day) => (
              <div key={day.dateKey} className="week-grid-dayhead">{day.label}</div>
            ))}
            {times.map((time) => (
              <Fragment key={time}>
                <div key={`t-${time}`} className="week-grid-time">{time}</div>
                {weekDays.map((day) => {
                  const apt = aptAt(day.dateKey, time);
                  const available = day.slots.includes(time) && !day.blocked;
                  return (
                    <div
                      key={`${day.dateKey}-${time}`}
                      className={`week-cell${apt ? " booked" : available ? " open" : " closed"}`}
                    >
                      {apt ? (
                        <Link to="/admin/citas" className="week-cell-apt">
                          <b>{apt.userId?.name?.split(" ").pop() || "Familia"}</b>
                          <span>{apt.serviceType?.slice(0, 20)}</span>
                        </Link>
                      ) : day.blocked ? (
                        <span className="week-cell-muted">Bloq.</span>
                      ) : null}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {tab === "slots" && (
        <div className="panel">
          <p className="panel-muted">Configura horarios por día y bloquea fechas de vacaciones.</p>
          {msg && <div className="alert alert-success">{msg}</div>}

          {DAYS.map(({ key, label }) => (
            <div key={key} style={{ marginTop: 20 }}>
              <h4>{label}</h4>
              <div className="slots">
                {slotTimes.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot${(weeklySlots[key] || []).includes(slot) ? " sel" : ""}`}
                    onClick={() => toggleSlot(key, slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <h3 style={{ marginTop: 28 }}>Fechas bloqueadas</h3>
          <div className="actions">
            <input type="date" value={newBlocked} onChange={(e) => setNewBlocked(e.target.value)} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={addBlocked}>Agregar</button>
          </div>
          <ul style={{ marginTop: 12 }}>
            {blockedDates.map((d) => (
              <li key={d}>
                {d}
                <button type="button" style={{ marginLeft: 8, background: "none", border: "none", color: "#b06a4f", cursor: "pointer" }} onClick={() => setBlockedDates(blockedDates.filter((x) => x !== d))}>×</button>
              </li>
            ))}
          </ul>

          <button type="button" className="btn btn-primary" style={{ marginTop: 20 }} onClick={save}>Guardar agenda</button>
        </div>
      )}
    </div>
  );
}
