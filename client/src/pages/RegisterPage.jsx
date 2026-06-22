import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { services } from "../../../shared/content.js";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    childName: "",
    birthDate: "",
    interestAreas: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const toggleInterest = (t) => {
    setForm((f) => ({
      ...f,
      interestAreas: f.interestAreas.includes(t)
        ? f.interestAreas.filter((x) => x !== t)
        : [...f.interestAreas, t],
    }));
  };

  const handleAccount = async (e) => {
    e.preventDefault();
    if (!accepted) {
      setError("Debes aceptar la política de privacidad");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        timezone: form.timezone,
      });
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.saveChildProfile({
        childName: form.childName,
        birthDate: form.birthDate || undefined,
        interestAreas: form.interestAreas,
      });
      navigate("/dashboard", { replace: true, state: { profileSaved: true, welcome: true, childName: form.childName } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scr" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "5vh 20px", background: "linear-gradient(180deg,var(--cream),var(--paper))" }}>
      <div className="auth-card-wide">
        <div className="auth-brand-row" style={{ marginBottom: "1.6rem" }}>
          <Brand />
        </div>
        <div className="stepper">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`stepper-bar${step >= i ? " done" : ""}${step === i ? " active" : ""}`} />
          ))}
        </div>
        {error && <div className="alert alert-error">{error}</div>}

        {step === 0 && (
          <form onSubmit={handleAccount}>
            <h2 className="auth-title" style={{ fontSize: "1.7rem" }}>Tus datos</h2>
            <p className="auth-sub" style={{ marginBottom: "1.4rem", fontSize: ".9rem" }}>Paso 1 de 3 · La cuenta de la familia</p>
            <div className="field">
              <label htmlFor="name">Nombre completo</label>
              <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="email">Correo</label>
              <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
            </div>
            <label className="check-item" style={{ marginTop: 16 }}>
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              Acepto la <Link to="/privacidad" target="_blank">política de privacidad</Link>
            </label>
            <div className="form-actions">
              <Link to="/login" style={{ color: "var(--muted)", fontWeight: 600, fontSize: ".9rem" }}>← Iniciar sesión</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creando..." : "Continuar →"}
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleProfile}>
            <h2 className="auth-title" style={{ fontSize: "1.7rem" }}>Sobre tu peque</h2>
            <p className="auth-sub" style={{ marginBottom: "1.4rem", fontSize: ".9rem" }}>Paso 2 de 3 · Personalizamos tu acompañamiento</p>
            <div className="field">
              <label>Nombre del niño/a (opcional)</label>
              <input value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} />
            </div>
            <div className="field">
              <label>Fecha de nacimiento</label>
              <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <label style={{ display: "block", fontSize: ".78rem", fontWeight: 600, margin: "16px 0 6px" }}>¿Qué te gustaría trabajar?</label>
            <div className="tag-row">
              {services.map((s) => (
                <button
                  key={s.t}
                  type="button"
                  className={`tag-pill${form.interestAreas.includes(s.t) ? " selected" : ""}`}
                  onClick={() => toggleInterest(s.t)}
                >
                  {s.t}
                </button>
              ))}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>← Atrás</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Guardando..." : "Continuar →"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div className="welcome-icon">🌱</div>
            <h2 className="auth-title" style={{ fontSize: "1.8rem" }}>¡Todo listo, {form.name.split(" ")[0]}!</h2>
            <p className="auth-sub" style={{ maxWidth: "38ch", margin: "0 auto 1.6rem" }}>
              Tu espacio está preparado{form.childName ? ` para ${form.childName}` : ""}. Ya puedes reservar tu primera asesoría con Adriana.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => navigate("/dashboard", { replace: true })}>
              Entrar a mi espacio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
