import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { BUSINESS_TZ, formatInZone } from "../../../shared/time.js";

function Leaf() {
  return (
    <svg className="leaf" viewBox="0 0 24 24" fill="none">
      <path d="M12 22C7 22 3 18 3 11 3 6 7 2 12 2c-1 4 3 5 6 7 3 2 3 6 0 9-2 2.5-4 4-6 4Z" fill="#7E9A86" />
      <path d="M12 22C9 18 8 13 9 8" stroke="#4E6553" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function Brand({ light }) {
  return (
    <Link to="/" className={`brand${light ? " light" : ""}`}>
      <Leaf />
      <div>
        <b>Adriana Villalobos</b>
        <span>Montessori 0–3</span>
      </div>
    </Link>
  );
}

export function Header({ simple }) {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const reserveTo = user ? (isAdmin ? "/admin" : "/citas/nueva") : "/registro";

  return (
    <header>
      <div className="wrap nav">
        <Brand />
        <nav className={`menu${open ? " open" : ""}`} id="menu">
          {!simple && (
            <>
              <a href="/#sobre" onClick={() => setOpen(false)}>Sobre mí</a>
              <a href="/#asesorias" onClick={() => setOpen(false)}>Asesorías</a>
              <a href="/#mi-camino" onClick={() => setOpen(false)}>Mi camino</a>
              <a href="/#recursos" onClick={() => setOpen(false)}>Recursos</a>
              <a href="/#escuela" onClick={() => setOpen(false)}>Escuela</a>
            </>
          )}
          {user ? (
            <>
              <Link to={isAdmin ? "/admin" : "/dashboard"} onClick={() => setOpen(false)}>
                {isAdmin ? "Panel admin" : "Mi panel"}
              </Link>
              <button type="button" className="btn btn-ghost" onClick={() => { logout(); setOpen(false); }}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Ingresar</Link>
              <Link to={reserveTo} className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
                Reservar asesoría
              </Link>
            </>
          )}
        </nav>
        <button className="burger" type="button" aria-label="Abrir menú" onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer id="contacto">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand light" style={{ marginBottom: "1rem" }}>
              <Leaf />
              <div>
                <b>Adriana Villalobos</b>
                <span>Montessori 0–3</span>
              </div>
            </div>
            <p>Montessori para la vida real: autonomía, límites respetuosos y hogares preparados para niños de 0 a 3 años.</p>
          </div>
          <div className="foot-col">
            <b>Explora</b>
            <a href="/#sobre">Sobre mí</a>
            <a href="/#asesorias">Asesorías</a>
            <a href="/#mi-camino">Mi camino</a>
            <a href="/#recursos">Recursos</a>
            <a href="/#escuela">Escuela en Osaka</a>
            <a href="/como-funciona">Cómo funciona</a>
          </div>
          <div className="foot-col">
            <b>Cuenta</b>
            <Link to="/login">Ingresar</Link>
            <Link to="/registro">Registrarse</Link>
            <Link to="/precios">Precios</Link>
          </div>
          <div className="foot-col">
            <b>Sígueme</b>
            <a href="https://instagram.com/narebyadriana" target="_blank" rel="noopener noreferrer">Instagram @narebyadriana</a>
            <b className="foot-sub">Legales</b>
            <Link to="/privacidad">Política de privacidad</Link>
          </div>
        </div>
        <div className="disclaimer">
          La asesoría es de carácter educativo y no sustituye la atención médica, psicológica o terapéutica. Cada niño y cada
          familia son únicos; las recomendaciones se adaptan a tu contexto.
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Adriana Villalobos Silva · Montessori 0–3</span>
          <span>Hecho con cuidado para acompañar a las familias.</span>
        </div>
      </div>
    </footer>
  );
}

export function Reveal({ children, className = "" }) {
  return <div className={`reveal in ${className}`}>{children}</div>;
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

/** Fecha y hora de una cita. Sin `timeZone` usa la zona del navegador (la de la familia). */
export function formatDateTime(iso, timeZone) {
  const date = formatInZone(iso, timeZone, { day: "numeric", month: "short", year: "numeric" });
  const time = formatInZone(iso, timeZone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${date} · ${time}`;
}

/** Igual que formatDateTime, pero siempre en hora de Japón (para el panel de Adriana) */
export function formatAdminDateTime(iso) {
  return formatDateTime(iso, BUSINESS_TZ);
}
