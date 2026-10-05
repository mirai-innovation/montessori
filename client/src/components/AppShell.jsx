import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Brand } from "./Layout";

const userLinks = [
  { to: "/dashboard", label: "Inicio", icon: "🏡", end: true },
  { to: "/citas", label: "Mis citas", icon: "🗓️" },
  { to: "/citas/nueva", label: "Reservar sesión", icon: "✦" },
  { to: "/sesiones", label: "Notas de sesión", icon: "📝" },
  { to: "/perfil", label: "Perfil familiar", icon: "🌱" },
];

const adminLinks = [
  { to: "/admin", label: "Panel general", icon: "📊", end: true },
  { to: "/admin/citas", label: "Citas", icon: "🗓️" },
  { to: "/admin/agenda", label: "Agenda", icon: "⚙" },
  { to: "/admin/familias", label: "Familias", icon: "👨‍👩‍👧" },
  { to: "/admin/ingresos", label: "Ingresos", icon: "💳" },
  { to: "/admin/interesados", label: "Interesados", icon: "✉️" },
];

export function UserAppShell({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <Brand />
        </div>
        <nav className="app-sidebar-nav">
          {userLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`}>
              <span className="app-nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-sidebar-card">
          <div className="app-sidebar-card-label">Sesiones</div>
          <div className="app-sidebar-card-title">Asesorías en línea</div>
          <Link to="/citas/nueva" className="btn btn-clay btn-sm" style={{ width: "100%", justifyContent: "center" }}>
            Reservar
          </Link>
        </div>
        <button type="button" className="app-nav-logout" onClick={() => { logout(); navigate("/"); }}>
          ↩ Cerrar sesión
        </button>
      </aside>
      <main className="app-page">{children}</main>
    </div>
  );
}

export function AdminAppShell({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <aside className="app-sidebar app-sidebar--admin">
        <div className="app-sidebar-brand light">
          <Brand light />
        </div>
        <nav className="app-sidebar-nav">
          {adminLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`}>
              <span className="app-nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-sidebar-card admin">
          <div className="app-sidebar-card-label">Hoy</div>
          <p className="app-sidebar-card-text">Gestiona citas, familias y notas de sesión desde un solo lugar.</p>
        </div>
        <button type="button" className="app-nav-logout light" onClick={() => { logout(); navigate("/"); }}>
          ↩ Cerrar sesión
        </button>
      </aside>
      <main className="app-page app-page--admin">{children}</main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
      </div>
      {action}
    </div>
  );
}
