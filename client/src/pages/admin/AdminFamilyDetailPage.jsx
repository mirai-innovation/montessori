import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { formatAdminDateTime } from "../../components/Layout";
import { formatMxn } from "../../utils/format";

export default function AdminFamilyDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.adminUser(id).then(setDetail).catch(() => {});
  }, [id]);

  if (!detail) return <div className="panel">Cargando…</div>;

  const { user, profile, appointments, payments, totalPaid, planLabel, childAge } = detail;
  const familyName = user.name?.split(" ").pop() || user.name;

  return (
    <div className="scr">
      <Link to="/admin/familias" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>← Familias</Link>

      <div className="profile-hero">
        <div className="welcome-icon" style={{ margin: 0 }}>👨‍👩‍👧</div>
        <div style={{ flex: 1 }}>
          <div className="page-eyebrow" style={{ color: "var(--sage-deep)" }}>Familia {familyName}</div>
          <h1 className="page-title" style={{ fontSize: "1.8rem" }}>
            {user.name}
          </h1>
          <p className="panel-muted" style={{ margin: 0 }}>
            {user.email}{profile?.childName ? ` · ${profile.childName}${childAge ? ` (${childAge})` : ""}` : ""}
          </p>
          <div className="profile-tags" style={{ marginTop: 10 }}>
            <span className="tag-pill selected" style={{ cursor: "default", fontSize: ".78rem" }}>{planLabel}</span>
            {user.sessionCredits > 0 && (
              <span className="tag-pill selected" style={{ cursor: "default", fontSize: ".78rem" }}>
                {user.sessionCredits} crédito{user.sessionCredits > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <Link to="/admin/citas" className="btn btn-primary btn-sm">Gestionar citas</Link>
      </div>

      <div className="dash-bottom-grid">
        <div className="panel" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: "1rem" }}>Historial de sesiones</h3>
          {appointments.length === 0 ? (
            <p className="empty">Sin sesiones aún.</p>
          ) : (
            <div className="timeline">
              {appointments.slice(0, 8).map((a) => (
                <div key={a._id} className="timeline-item">
                  <div className="timeline-dot" data-status={a.status} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{formatAdminDateTime(a.scheduledAt)}</div>
                    <div style={{ fontSize: ".86rem", color: "var(--muted)" }}>
                      {a.serviceType} · {a.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="panel" style={{ marginBottom: 0 }}>
            <h3 style={{ marginBottom: ".8rem" }}>Datos</h3>
            <div className="summary-row"><span>Foco</span><b>{(profile?.interestAreas || []).slice(0, 2).join(" · ") || "—"}</b></div>
            <div className="summary-row"><span>Sesiones</span><b>{appointments.filter((a) => a.status === "completada").length} completadas</b></div>
            <div className="summary-row"><span>Créditos</span><b>{user.sessionCredits || 0}</b></div>
            {profile?.firstSessionGoal && (
              <p className="panel-muted" style={{ marginTop: 12, fontSize: ".88rem" }}>
                Meta: {profile.firstSessionGoal}
              </p>
            )}
          </div>

          <div className="panel" style={{ marginBottom: 0 }}>
            <h3 style={{ marginBottom: ".8rem" }}>Pagos</h3>
            <div className="summary-row total"><span>Total aportado</span><b style={{ color: "var(--sage-deep)" }}>{formatMxn(totalPaid)}</b></div>
            {payments.length > 0 ? (
              <ul style={{ listStyle: "none", marginTop: 12, fontSize: ".88rem" }}>
                {payments.slice(0, 4).map((p) => (
                  <li key={p._id} style={{ padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                    {new Date(p.paidAt).toLocaleDateString("es-MX")} — {formatMxn(p.amount)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel-muted" style={{ marginTop: 8, fontSize: ".88rem" }}>Sin pagos registrados.</p>
            )}
          </div>

          {user.adminNotes && (
            <div className="panel" style={{ marginBottom: 0 }}>
              <h3 style={{ marginBottom: ".6rem" }}>Notas internas</h3>
              <p style={{ fontSize: ".9rem", color: "#544d45" }}>{user.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
