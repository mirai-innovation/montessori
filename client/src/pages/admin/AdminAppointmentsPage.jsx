import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { StatusBadge, formatAdminDateTime } from "../../components/Layout";

export default function AdminAppointmentsPage() {
  const [params] = useSearchParams();
  const status = params.get("status") || "";
  const [appointments, setAppointments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: "", meetingLink: "", adminNotes: "" });
  const [noteForm, setNoteForm] = useState({ summary: "", observations: "", recommendations: "", nextSteps: "", publish: false });

  const load = () => {
    api.adminAppointments(status || undefined).then((d) => setAppointments(d.appointments));
  };

  useEffect(load, [status]);

  const openEdit = (apt) => {
    setEditing(apt);
    setForm({ status: apt.status, meetingLink: apt.meetingLink || "", adminNotes: apt.adminNotes || "" });
    api.adminGetNote(apt._id).then((d) => {
      if (d.note) {
        setNoteForm({
          summary: d.note.summary || "",
          observations: d.note.observations || "",
          recommendations: d.note.recommendations || "",
          nextSteps: d.note.nextSteps || "",
          publish: d.note.isPublished || false,
        });
      } else {
        setNoteForm({ summary: "", observations: "", recommendations: "", nextSteps: "", publish: false });
      }
    });
  };

  const saveAppointment = async () => {
    await api.adminUpdateAppointment(editing._id, form);
    setEditing(null);
    load();
  };

  const saveNote = async (publish) => {
    await api.adminSaveNote({ appointmentId: editing._id, ...noteForm, publish });
    if (publish) alert("Nota publicada y familia notificada");
    load();
  };

  return (
    <div className="scr">
      <PageHeader
        eyebrow="Administración"
        title="Gestión de citas"
      />
      <div className="panel">
        <div className="actions">
          <Link to="/admin/citas" className={`btn btn-ghost btn-sm${!status ? " btn-primary" : ""}`}>Todas</Link>
          <Link to="/admin/citas?status=solicitada" className="btn btn-ghost btn-sm">Solicitadas</Link>
          <Link to="/admin/citas?status=confirmada" className="btn btn-ghost btn-sm">Confirmadas</Link>
          <Link to="/admin/citas?status=completada" className="btn btn-ghost btn-sm">Completadas</Link>
        </div>
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Familia</th>
                <th>Asesoría</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id}>
                  <td>{formatAdminDateTime(a.scheduledAt)}</td>
                  <td>{a.userId?.name}<br /><small>{a.userId?.email}</small></td>
                  <td>{a.serviceType}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Gestionar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="panel">
          <h3>Cita — {editing.userId?.name}</h3>
          <div className="field">
            <label>Estado</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["solicitada", "confirmada", "completada", "cancelada", "reprogramada"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Enlace videollamada</label>
            <input value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://zoom.us/..." />
          </div>
          <div className="field">
            <label>Notas internas (solo admin)</label>
            <textarea className="field-input" value={form.adminNotes} onChange={(e) => setForm({ ...form, adminNotes: e.target.value })} />
          </div>
          <div className="actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={saveAppointment}>Guardar cita</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cerrar</button>
          </div>

          <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid var(--line)" }} />
          <h3>Nota de sesión</h3>
          <div className="field">
            <label>Resumen</label>
            <textarea className="field-input" value={noteForm.summary} onChange={(e) => setNoteForm({ ...noteForm, summary: e.target.value })} />
          </div>
          <div className="field">
            <label>Observaciones Montessori</label>
            <textarea className="field-input" value={noteForm.observations} onChange={(e) => setNoteForm({ ...noteForm, observations: e.target.value })} />
          </div>
          <div className="field">
            <label>Recomendaciones prácticas</label>
            <textarea className="field-input" value={noteForm.recommendations} onChange={(e) => setNoteForm({ ...noteForm, recommendations: e.target.value })} />
          </div>
          <div className="field">
            <label>Próximos pasos</label>
            <textarea className="field-input" value={noteForm.nextSteps} onChange={(e) => setNoteForm({ ...noteForm, nextSteps: e.target.value })} />
          </div>
          <div className="actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => saveNote(false)}>Guardar borrador</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => saveNote(true)}>Publicar nota</button>
          </div>
        </div>
      )}
    </div>
  );
}
