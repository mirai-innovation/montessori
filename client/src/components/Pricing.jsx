import { launchOffer, servicePlans } from "../../../shared/content.js";

const giftIcon = (size) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M4 12v9h16v-9M12 8V21M12 8S10.4 3 7.6 4.3 9 8 12 8zM12 8s1.6-5 4.4-3.7S15 8 12 8z" />
  </svg>
);

export function GiftIcon({ size = 16 }) {
  return giftIcon(size);
}

/** Banda de la primera asesoría gratis + oferta de lanzamiento + tarjetas de precios */
export function PricingGrid({ action }) {
  const free = servicePlans.find((p) => p.firstTimeOnly);
  const paid = servicePlans.filter((p) => !p.firstTimeOnly);

  return (
    <>
      {free && (
        <div className="free-band">
          <div className="fb-ic">{giftIcon(32)}</div>
          <div>
            <h3>Tu primera asesoría es <span>GRATIS</span></h3>
            <p>
              Si es tu <b>primera vez</b>, agenda una sesión de <b>30 minutos sin costo</b> para conocernos y darte una
              primera orientación. Solo necesitas completar el <b>cuestionario previo</b> sobre tu hijo y tu principal dificultad.
            </p>
            <span className="fb-first">Exclusivo para nuevas familias · una por familia</span>
          </div>
          {action(free, "btn btn-clay")}
        </div>
      )}
      <div className="launch">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
        {launchOffer}
      </div>
      <div className="price-grid">
        {paid.map((p) => (
          <div key={p.id} className={`price-card${p.featured ? " feat" : ""}`}>
            {p.featured && <span className="price-badge">Más elegida</span>}
            <h3>{p.name}</h3>
            <p className="desc">{p.desc}</p>
            <div className="price">
              {p.priceLabel.replace(" MXN", "")} {p.priceLabel.endsWith("MXN") && <small>MXN</small>}
            </div>
            <div className="go">{action(p)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
