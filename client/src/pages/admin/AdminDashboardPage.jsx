import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { formatMxn } from "../../utils/format";

const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const now = new Date();
  const dateLabel = `${weekdays[now.getDay()]} · ${now.getDate()} de ${months[now.getMonth()]}`;

  useEffect(() => {
    api.adminDashboard()
      .then((data) => {
        setStats(data.stats);
        setAppointments(data.todayAppointments || []);
        setAtRisk(data.atRisk || []);
      })
      .catch(() => {});
  }, []);

  if (!stats) return <div className="panel">Cargando...</div>;

  return (
    <div className="scr">
      <PageHeader
        eyebrow={dateLabel}
        title="Buen día, Adriana"
        action={<Link to="/admin/agenda" className="btn btn-primary btn-sm">Ver agenda</Link>}
      />

      {stats.pending > 0 && (
        <div className="hero-card" style={{ marginBottom: 22 }}>
          <div className="hero-card-label">Atención</div>
          <h3>{stats.pending} solicitud{stats.pending > 1 ? "es" : ""} por confirmar</h3>
          <div className="hero-card-meta">Revisa y confirma las reservas de las familias</div>
          <Link to="/admin/citas?status=solicitada" className="btn btn-sm btn-white">Ver solicitudes</Link>
        </div>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        <Link to="/admin/ingresos" className="metric-card" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="metric-card-label">Ingresos del mes</div>
          <b>{formatMxn(stats.monthRevenue || 0)}</b>
          {stats.monthGrowth ? (
            <div className="metric-card-hint" style={{ color: stats.monthGrowth > 0 ? "var(--sage)" : "var(--clay)" }}>
              {stats.monthGrowth > 0 ? "▲" : "▼"} {Math.abs(stats.monthGrowth)}%
            </div>
          ) : null}
        </Link>
        <div className="metric-card">
          <div className="metric-card-label">Solicitudes pendientes</div>
          <b>{stats.pending}</b>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Citas hoy</div>
          <b>{stats.todayCount}</b>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Esta semana</div>
          <b>{stats.weekCount}</b>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Familias activas</div>
          <b>{stats.activeFamilies}</b>
          <div className="metric-card-hint">{stats.cancelRate}% cancelaciones</div>
        </div>
      </div>

      <div className="dash-bottom-grid">
        <div className="panel" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: "1rem" }}>Sesiones de hoy</h3>
          {appointments.length === 0 ? (
            <p className="empty" style={{ padding: "12px 0" }}>No hay sesiones programadas para hoy.</p>
          ) : (
            appointments.map((a) => {
              const d = new Date(a.scheduledAt);
              const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
              return (
                <div key={a._id} className="session-row">
                  <div className="session-time">
                    <b>{time}</b>
                    <span>60 min</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{a.userId?.name || "Familia"}</div>
                    <div style={{ fontSize: ".84rem", color: "var(--muted)" }}>{a.serviceType}</div>
                  </div>
                  <Link to={`/admin/familias/${a.userId?._id || ""}`} className="btn btn-primary btn-sm">Ver familia</Link>
                </div>
              );
            })
          )}
        </div>

        <div className="panel" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: "1rem" }}>Necesitan atención</h3>
          {atRisk.length === 0 ? (
            <p className="empty" style={{ padding: "12px 0" }}>Todas las familias activas recientemente.</p>
          ) : (
            atRisk.map((f) => (
              <Link key={f._id} to={`/admin/familias/${f._id}`} className="attention-row">
                <span className="attention-dot" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{f.name}</div>
                  <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                    Sin actividad {f.inactiveDays} días
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
