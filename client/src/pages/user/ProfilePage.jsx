import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { quotes, services } from "../../../../shared/content.js";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    childName: "",
    birthDate: "",
    languages: "",
    attendsSchool: false,
    schoolName: "",
    interestAreas: [],
    concerns: [],
    firstSessionGoal: "",
    notes: "",
  });
  const [account, setAccount] = useState({ name: "", phone: "", timezone: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getChildProfile(), api.me()]).then(([prof, me]) => {
      if (prof.profile) {
        setForm({
          childName: prof.profile.childName || "",
          birthDate: prof.profile.birthDate ? prof.profile.birthDate.slice(0, 10) : "",
          languages: prof.profile.languages || "",
          attendsSchool: prof.profile.attendsSchool || false,
          schoolName: prof.profile.schoolName || "",
          interestAreas: prof.profile.interestAreas || [],
          concerns: prof.profile.concerns || [],
          firstSessionGoal: prof.profile.firstSessionGoal || "",
          notes: prof.profile.notes || "",
        });
      }
      setAccount({
        name: me.user.name,
        phone: me.user.phone || "",
        timezone: me.user.timezone || "",
      });
    });
  }, []);

  const toggleArray = (key, value) => {
    setForm((f) => {
      const arr = f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value];
      return { ...f, [key]: arr };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      await api.saveChildProfile(form);
      await api.updateAccount(account);
      navigate("/dashboard", { replace: true, state: { profileSaved: true, childName: form.childName } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const firstName = account.name?.split(" ")[0] || "familia";

  return (
    <div className="scr">
      <PageHeader
        eyebrow="Tu espacio familiar"
        title="Perfil familiar"
      />

      <div className="profile-hero">
        <div className="welcome-icon" style={{ margin: 0, flexShrink: 0 }}>🌱</div>
        <div>
          <div className="page-eyebrow" style={{ color: "var(--sage-deep)" }}>Hola, {firstName}</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: "1.5rem", marginBottom: 6 }}>
            {form.childName ? `Acompañando a ${form.childName}` : "Cuéntanos sobre tu peque"}
          </h2>
          <p className="panel-muted" style={{ margin: 0 }}>
            Esta información ayuda a Adriana a preparar cada sesión con calidez y precisión.
          </p>
          {form.interestAreas.length > 0 && (
            <div className="profile-tags">
              {form.interestAreas.map((t) => (
                <span key={t} className="tag-pill selected" style={{ cursor: "default", fontSize: ".78rem" }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSave}>
          <h3 style={{ marginTop: 0 }}>Tu cuenta</h3>
          <div className="field">
            <label>Nombre</label>
            <input value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} />
          </div>

          <h3 style={{ marginTop: 24 }}>Tu hijo/a (0–3 años)</h3>
          <div className="field">
            <label>Nombre del niño/a (opcional)</label>
            <input value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} />
          </div>
          <div className="field">
            <label>Fecha de nacimiento</label>
            <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Idiomas en casa</label>
            <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="Español, inglés..." />
          </div>
          <label className="check-item" style={{ marginTop: 12 }}>
            <input type="checkbox" checked={form.attendsSchool} onChange={(e) => setForm({ ...form, attendsSchool: e.target.checked })} />
            Asiste a escuela o guardería
          </label>
          {form.attendsSchool && (
            <div className="field">
              <label>Nombre de la escuela</label>
              <input value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
            </div>
          )}

          <h4 style={{ marginTop: 20, marginBottom: 8 }}>Áreas de interés</h4>
          <div className="tag-row">
            {services.map((s) => (
              <button
                key={s.t}
                type="button"
                className={`tag-pill${form.interestAreas.includes(s.t) ? " selected" : ""}`}
                onClick={() => toggleArray("interestAreas", s.t)}
              >
                {s.t}
              </button>
            ))}
          </div>

          <h4 style={{ marginTop: 20, marginBottom: 8 }}>Preocupaciones actuales</h4>
          <div className="check-grid">
            {quotes.map((q) => (
              <label key={q.q} className="check-item">
                <input type="checkbox" checked={form.concerns.includes(q.q)} onChange={() => toggleArray("concerns", q.q)} />
                {q.q}
              </label>
            ))}
          </div>

          <div className="field" style={{ marginTop: 20 }}>
            <label>¿Qué te gustaría trabajar en la primera sesión?</label>
            <textarea className="field-input" value={form.firstSessionGoal} onChange={(e) => setForm({ ...form, firstSessionGoal: e.target.value })} />
          </div>
          <div className="field">
            <label>Notas adicionales</label>
            <textarea className="field-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar perfil"}
          </button>
        </form>
      </div>
    </div>
  );
}
