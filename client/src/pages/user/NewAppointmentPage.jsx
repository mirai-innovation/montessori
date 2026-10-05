import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookingCalendar } from "../../components/BookingCalendar";
import { PageHeader } from "../../components/AppShell";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { bookingPlans, serviceTypes, isPaidPlan } from "../../../../shared/content.js";
import { formatAppointmentBoth, fromTokyo } from "../../../../shared/time.js";

const STEP_LABELS = ["Fecha y hora", "Plan", "Confirmar"];
const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateKey, setDateKey] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [serviceType, setServiceType] = useState(serviceTypes[0]);
  const [userNotes, setUserNotes] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [plans, setPlans] = useState(bookingPlans);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const fetchAvailability = useCallback((year, month) => api.getAvailability(year, month), []);

  useEffect(() => {
    api.getAppointments()
      .then((d) => setIsFirstTime(!d.appointments.some((a) => a.status !== "cancelada")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.stripeConfig().then((c) => {
      setStripeEnabled(c.enabled);
      if (c.bookingPlans) setPlans(c.bookingPlans);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const paid = params.get("paid");
    const sessionId = params.get("session_id");
    if (paid && sessionId) {
      setLoading(true);
      let tries = 0;
      const poll = () => {
        api.bookingStatus(sessionId).then((d) => {
          if (d.ready) {
            refreshUser();
            setDone(true);
            setStep(3);
            setLoading(false);
            setParams({}, { replace: true });
          } else if (tries++ < 12) {
            setTimeout(poll, 1500);
          } else {
            setError("El pago se procesó; revisa Mis citas en unos minutos.");
            setLoading(false);
          }
        }).catch(() => setLoading(false));
      };
      poll();
    }
  }, [params, refreshUser, setParams]);

  const handleSelect = ({ date, dateKey: dk, slot }) => {
    setSelectedDate(date);
    setDateKey(dk);
    if (slot !== undefined) setSelectedSlot(slot);
  };

  const availablePlans = plans.filter((p) => {
    if (p.id === "credit") return (user?.sessionCredits || 0) > 0;
    if (p.firstTimeOnly) return isFirstTime;
    if (isPaidPlan(p)) return stripeEnabled;
    return true;
  });

  const selectedPlanInfo = plans.find((p) => p.id === selectedPlan) || plans[0];
  const needsPayment = isPaidPlan(selectedPlanInfo);
  const whenLabel = dateKey && selectedSlot ? formatAppointmentBoth(fromTokyo(dateKey, selectedSlot), LOCAL_TZ) : null;

  const goNext = () => {
    setError("");
    if (step === 0) {
      if (!dateKey || !selectedSlot) {
        setError("Elige una fecha y un horario");
        return;
      }
      setStep(1);
      if (!availablePlans.find((p) => p.id === selectedPlan)) {
        const preferred = ["credit", "free30", "personal", "request"].find((id) => availablePlans.some((p) => p.id === id));
        setSelectedPlan(preferred || "request");
      }
    } else if (step === 1) {
      setStep(2);
    }
  };

  const confirmBooking = async () => {
    if (!dateKey || !selectedSlot) return;
    setLoading(true);
    setError("");
    try {
      if (needsPayment) {
        const { url } = await api.bookingCheckout({
          dateKey,
          time: selectedSlot,
          serviceType,
          userNotes,
          packageId: selectedPlan,
        });
        if (url) window.location.href = url;
        return;
      }
      await api.createAppointment({
        dateKey,
        time: selectedSlot,
        serviceType,
        userNotes,
        paymentPlan: selectedPlan,
      });
      await refreshUser();
      setDone(true);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 || done) {
    return (
      <div className="scr">
        <div className="panel" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
          <div className="welcome-icon">✓</div>
          <h2 className="auth-title" style={{ fontSize: "1.8rem" }}>¡Reserva enviada!</h2>
          <p className="auth-sub" style={{ maxWidth: "42ch", margin: "0 auto 1.4rem" }}>
            {whenLabel ? <>Tu asesoría está agendada para el <b>{whenLabel}</b>.</> : "Tu asesoría quedó agendada."}
            Adriana confirmará por correo con el enlace de videollamada.
          </p>
          <Link to="/dashboard" className="btn btn-primary">Ir a mi inicio</Link>
          <Link to="/citas" className="btn btn-ghost" style={{ marginLeft: 8 }}>Ver mis citas</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="scr">
      <PageHeader eyebrow="Sesión en línea" title="Reservar asesoría" />

      <div className="book-stepper">
        {STEP_LABELS.map((label, i) => (
          <span key={label} className={`book-step${step >= i ? " active" : ""}${step === i ? " current" : ""}`}>
            <b>{i + 1}</b> {label}
          </span>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && params.get("paid") && <div className="alert alert-warm">Confirmando tu pago…</div>}

      <div className="book-grid">
        {step === 0 && (
          <>
            <BookingCalendar
              onSelect={handleSelect}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              fetchAvailability={fetchAvailability}
            />
            <div className="booking-side">
              <h3>Detalles</h3>
              <p className="hint">
                {selectedDate && selectedSlot
                  ? whenLabel
                  : "Selecciona fecha y horario"}
              </p>
              <div className="field">
                <label>Tipo de asesoría</label>
                <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                  {serviceTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Notas para Adriana (opcional)</label>
                <textarea className="field-input" value={userNotes} onChange={(e) => setUserNotes(e.target.value)} rows={3} />
              </div>
              <button type="button" className="btn btn-primary book-confirm" onClick={goNext}>
                Continuar a plan →
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="booking-plans-wrap">
            <h3 style={{ fontFamily: "var(--display)", marginBottom: "1rem" }}>Elige tu plan</h3>
            {isFirstTime && (
              <p className="alert alert-warm">
                ¿Primera vez? Tu primera asesoría de 30 min es gratis. Antes de la sesión completa el cuestionario de tu{" "}
                <Link to="/perfil">perfil familiar</Link> sobre tu hijo y tu principal dificultad.
              </p>
            )}
            {(user?.sessionCredits || 0) > 0 && (
              <p className="panel-muted" style={{ marginBottom: 16 }}>
                Tienes <b>{user.sessionCredits}</b> crédito{user.sessionCredits > 1 ? "s" : ""} disponible{user.sessionCredits > 1 ? "s" : ""}.
              </p>
            )}
            <div className="plan-grid">
              {availablePlans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`plan-card${selectedPlan === p.id ? " selected" : ""}`}
                  onClick={() => setSelectedPlan(p.id)}
                >
                  <div className="plan-card-name">{p.name}</div>
                  <div className="plan-card-mode">{p.desc}</div>
                  <div className="plan-card-price">{p.priceLabel}</div>
                </button>
              ))}
            </div>
            <div className="form-actions" style={{ marginTop: 24 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>← Atrás</button>
              <button type="button" className="btn btn-primary" onClick={goNext}>Continuar →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-summary-wrap">
            <div className="booking-side" style={{ maxWidth: 480 }}>
              <h3>Resumen</h3>
              <div className="summary-row"><span>Fecha y hora</span><b style={{ textAlign: "right", maxWidth: "26ch" }}>{whenLabel}</b></div>
              <div className="summary-row"><span>Asesoría</span><b>{serviceType}</b></div>
              <div className="summary-row"><span>Plan</span><b>{selectedPlanInfo.name}</b></div>
              <div className="summary-row total"><span>Total</span><b>{selectedPlanInfo.priceLabel}</b></div>
              <p className="hint" style={{ marginTop: 16, display: "flex", gap: 6, alignItems: "flex-start" }}>
                <span>🔒</span> Pago seguro · cancela hasta 24h antes sin costo
              </p>
              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Atrás</button>
                <button type="button" className="btn btn-primary" disabled={loading} onClick={confirmBooking}>
                  {loading ? "Procesando…" : needsPayment ? "Confirmar y pagar" : "Confirmar reserva"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
