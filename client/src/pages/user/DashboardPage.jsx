import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { formatDateTime } from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export default function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [profileMsg, setProfileMsg] = useState("");
  const [upcoming, setUpcoming] = useState(null);
  const [lastNote, setLastNote] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notesCount, setNotesCount] = useState(0);

  const now = new Date();
  const dateLabel = `${weekdays[now.getDay()]} · ${now.getDate()} de ${months[now.getMonth()]}`;
  const firstName = user?.name?.split(" ")[0] || "familia";

  useEffect(() => {
    if (location.state?.profileSaved) {
      setProfileMsg(
        location.state.welcome
          ? `¡Todo listo${location.state.childName ? ` para ${location.state.childName}` : ""}! Tu espacio está preparado.`
          : `Perfil actualizado${location.state.childName ? ` — ${location.state.childName}` : ""} correctamente.`
      );
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  useEffect(() => {
    Promise.all([
      api.getUpcoming(),
      api.getSessionNotes(),
      api.getChildProfile(),
    ]).then(([up, notes, prof]) => {
      setUpcoming(up.appointment);
      setLastNote(notes.notes?.[0] || null);
      setNotesCount(notes.notes?.length || 0);
      setProfile(prof.profile);
    }).catch(() => {});
  }, []);

  return (
    <div className="scr">
      <PageHeader
        eyebrow={dateLabel}
        title={`Hola, ${firstName} 🌿`}
        action={
          <Link to="/citas/nueva" className="btn btn-primary btn-sm">+ Reservar asesoría</Link>
        }
      />

      {profileMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{profileMsg}</div>}

      {!profile?.interestAreas?.length && (
        <div className="alert alert-warm" style={{ marginBottom: 20 }}>
          <b>Completa el perfil de tu hijo/a</b> — ayuda a Adriana a preparar cada sesión.{" "}
          <Link to="/perfil" style={{ color: "var(--sage-deep)", fontWeight: 600 }}>Completar ahora →</Link>
        </div>
      )}

      <div className="dash-top-grid">
        <div className="hero-card">
          <div className="hero-card-label">Tu próxima sesión</div>
          {upcoming ? (
            <>
              <h3>{upcoming.serviceType}</h3>
              <div className="hero-card-meta">{formatDateTime(upcoming.scheduledAt)} · con Adriana</div>
              <div className="actions">
                {upcoming.meetingLink && upcoming.status === "confirmada" && (
                  <a href={upcoming.meetingLink} target="_blank" rel="noreferrer" className="btn btn-sm btn-white">
                    Unirme por video
                  </a>
                )}
                <Link to="/citas" className="btn btn-sm btn-ghost-white">Ver citas</Link>
              </div>
            </>
          ) : (
            <>
              <h3>Aún no tienes cita</h3>
              <div className="hero-card-meta">Reserva tu primera asesoría en línea</div>
              <Link to="/citas/nueva" className="btn btn-sm btn-white">Reservar ahora</Link>
            </>
          )}
        </div>

        <div className="panel" style={{ marginBottom: 0, display: "flex", flexDirection: "column" }}>
          <div className="page-eyebrow" style={{ color: "var(--clay)" }}>Resumen</div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: "1.18rem", marginBottom: ".6rem" }}>Tu acompañamiento</h3>
          <p className="panel-muted" style={{ flex: 1 }}>
            {notesCount > 0
              ? `Tienes ${notesCount} nota${notesCount > 1 ? "s" : ""} de sesión guardada${notesCount > 1 ? "s" : ""}.`
              : "Después de cada sesión, Adriana publicará recomendaciones prácticas para casa."}
          </p>
          <Link to="/sesiones" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
            Ver notas →
          </Link>
        </div>
      </div>

      <div className="dash-bottom-grid">
        <div className="panel" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3>Última nota de sesión</h3>
            {lastNote && <Link to={`/sesiones/${lastNote._id}`} style={{ fontSize: ".82rem", color: "var(--sage-deep)", fontWeight: 600 }}>Leer</Link>}
          </div>
          {lastNote ? (
            <p style={{ color: "#544d45", fontSize: ".92rem" }}>
              {lastNote.summary?.slice(0, 140)}{lastNote.summary?.length > 140 ? "..." : ""}
            </p>
          ) : (
            <p className="empty" style={{ padding: "12px 0" }}>Aún no hay notas publicadas.</p>
          )}
        </div>

        <div className="panel" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: "1rem" }}>Perfil familiar</h3>
          {profile?.childName ? (
            <>
              <p><b>{profile.childName}</b></p>
              <div className="profile-tags" style={{ marginTop: 10 }}>
                {(profile.interestAreas || []).slice(0, 3).map((t) => (
                  <span key={t} className="tag-pill selected" style={{ cursor: "default", fontSize: ".78rem" }}>{t}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="panel-muted">Cuéntanos sobre tu peque para personalizar las sesiones.</p>
          )}
          <Link to="/perfil" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>Editar perfil →</Link>
        </div>
      </div>
    </div>
  );
}
