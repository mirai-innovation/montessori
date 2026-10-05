import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";

const TABS = [
  { id: "guide", label: "Guía gratuita" },
  { id: "school", label: "Escuela en Osaka" },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminLeadsPage() {
  const [type, setType] = useState("guide");
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLeads(null);
    setError("");
    api.adminLeads(type).then((d) => setLeads(d.leads)).catch((e) => setError(e.message));
  }, [type]);

  return (
    <div className="scr">
      <PageHeader eyebrow="Comunidad" title="Interesados" />
      <div className="agenda-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`agenda-tab${type === t.id ? " active" : ""}`} onClick={() => setType(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="panel">
        {!leads && !error && <p className="panel-muted">Cargando…</p>}
        {leads && leads.length === 0 && <p className="empty">Todavía no hay registros.</p>}
        {leads && leads.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  {type === "guide" && <th>Edad del niño</th>}
                  {type === "guide" && <th>Principal dificultad</th>}
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l._id}>
                    <td>{formatDate(l.createdAt)}</td>
                    <td>{l.name || "—"}</td>
                    <td><a href={`mailto:${l.email}`}>{l.email}</a></td>
                    {type === "guide" && <td>{l.childAge || "—"}</td>}
                    {type === "guide" && <td>{l.mainNeed || "—"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
