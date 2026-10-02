import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

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
        <span>Montessori en Casa 0–3</span>
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
              <a href="/#ayuda" onClick={() => setOpen(false)}>Cómo te ayudo</a>
              <a href="/#mi-camino" onClick={() => setOpen(false)}>Mi camino</a>
              <a href="/#formacion" onClick={() => setOpen(false)}>Formación</a>
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
                Reservar sesión
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
                <span>Montessori en Casa 0–3</span>
              </div>
            </div>
            <p>Observación Montessori, crianza respetuosa y soluciones concretas para la vida diaria con tu hijo de 0 a 3 años.</p>
          </div>
          <div className="foot-col">
            <b>Explora</b>
            <a href="/#sobre">Sobre mí</a>
            <a href="/#asesorias">Asesorías</a>
            <a href="/#ayuda">Cómo te ayudo</a>
            <a href="/#mi-camino">Mi camino</a>
            <a href="/como-funciona">Cómo funciona</a>
          </div>
          <div className="foot-col">
            <b>Cuenta</b>
            <Link to="/login">Ingresar</Link>
            <Link to="/registro">Registrarse</Link>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/precios">Precios</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Adriana Villalobos</span>
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

export function formatDateTime(iso) {
  const d = new Date(iso);
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${time}`;
}
