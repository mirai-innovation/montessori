import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Header, Footer } from "../components/Layout";
import { PricingGrid } from "../components/Pricing";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { isPaidPlan } from "../../../shared/content.js";

export default function PreciosPage() {
  const { user, isAdmin } = useAuth();
  const [params] = useSearchParams();
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.stripeConfig().then((c) => setStripeEnabled(c.enabled)).catch(() => {});
  }, []);

  const reserveTo = user ? (isAdmin ? "/admin" : "/citas/nueva") : "/registro";

  const checkout = async (packageId) => {
    if (!user) {
      window.location.href = "/registro";
      return;
    }
    setLoading(true);
    try {
      const { url } = await api.stripeCheckout(packageId);
      if (url) window.location.href = url;
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const action = (plan, className) => {
    if (stripeEnabled && isPaidPlan(plan) && user && !isAdmin) {
      return (
        <button type="button" className={className || "btn btn-primary btn-sm"} disabled={loading} onClick={() => checkout(plan.id)}>
          Comprar
        </button>
      );
    }
    return <Link to={reserveTo} className={className}>{plan.firstTimeOnly ? "Agendar mi sesión gratis" : "Reservar →"}</Link>;
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Inversión</span>
            <h2>Precios y asesorías</h2>
            <p>Sesiones individuales en línea. Al comprar una asesoría recibes un crédito que puedes usar al reservar tu fecha y hora.</p>
          </div>
          {params.get("success") && <div className="alert alert-success">¡Pago recibido! Tus créditos se acreditarán en breve.</div>}
          <PricingGrid action={action} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
