import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header, Footer, Reveal } from "../components/Layout";
import { JourneyCard } from "../components/Journey";
import { GiftIcon, PricingGrid } from "../components/Pricing";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { journeyPosts, testimonials } from "../../../shared/content.js";

const IMAGES = {
  hero: "/assets/hero.jpg",
  about: "/assets/about.jpg",
  concern: "/assets/concern.jpg",
  galleryJapan: ["/assets/gallery-1.jpg", "/assets/gallery-2.jpg"],
  galleryMusic: "/assets/gallery-music.png",
  gallerySports: "/assets/gallery-sports.png",
};

const AREAS = [
  { t: "Autonomía y participación en casa", d: "Ayudar al niño a hacer más por sí mismo y a colaborar en la vida diaria del hogar.", i: '<path d="M9 11V6a3 3 0 0 1 6 0v5M5 11h14l-1 9H6l-1-9z"/>' },
  { t: "Rutinas y transiciones cotidianas", d: "Mañanas, comidas, siesta, baño y sueño más tranquilos, con menos luchas de poder.", i: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
  { t: "Ambiente preparado en espacios pequeños", d: "Organizar el hogar para favorecer orden, concentración e independencia, aunque haya poco espacio.", i: '<path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/>' },
  { t: "Límites respetuosos", d: "Límites firmes y amorosos, acompañando la frustración sin castigos, amenazas ni premios constantes.", i: '<path d="M12 21s-8-4.5-8-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-8 10-8 10z"/>' },
  { t: "Alimentación, movimiento y lenguaje", d: "Acompañar el desarrollo motor, la comunicación y una relación sana con la comida.", i: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>' },
  { t: "Selección de actividades", d: "Qué ofrecer según la edad y las necesidades del niño, sin comprar de más.", i: '<path d="M4 6h16M4 12h10M4 18h7"/>' },
];

const STEPS = [
  { t: "Elige el servicio", d: "Selecciona la asesoría que mejor se ajusta a tu momento." },
  { t: "Completa el cuestionario", d: "Cuéntame sobre tu hijo y tu principal dificultad." },
  { t: "Realiza el pago", d: "Pago seguro en línea para confirmar tu lugar." },
  { t: "Agenda fecha y hora", d: "Eliges el horario que mejor te quede." },
  { t: "Recibe la confirmación", d: "Confirmación con instrucciones para la sesión." },
  { t: "Tus cambios prioritarios", d: "Tras la sesión recibes tus 3–5 cambios clave y la opción de seguimiento." },
];

const CREDS = [
  {
    src: "/assets/cred-diploma.jpg",
    alt: "Diploma de Guía Montessori AMI 0–3 en proceso de emisión",
    title: "Guía Montessori AMI 0–3 · diploma en proceso de emisión",
    meta: "Vista previa del documento en trámite ante AMI",
    accent: "var(--clay)",
  },
  {
    src: "/assets/cred-1.jpg",
    alt: "Certificado AMI Montessori 0–3 Assistants Course Adjunct",
    title: "AMI Montessori 0–3 Assistants Course Adjunct",
    meta: "Montessori Stoppani · Tijuana, México · 2024 · Cert. C15708",
    accent: "var(--sage)",
  },
  {
    src: "/assets/cred-2.jpg",
    alt: "Constancia del 30° Congreso Internacional Montessori",
    title: "30° Congreso Internacional Montessori \"Joyful Journey\"",
    meta: "Mérida, México · 28 horas · 2026",
    accent: "var(--sage)",
  },
];

const posts = journeyPosts.filter((p) => p.published);

function Icon({ paths, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <g dangerouslySetInnerHTML={{ __html: paths }} />
    </svg>
  );
}

/** Formulario de la guía gratuita / lista de la escuela; guarda el registro en el servidor */
function useLeadForm(type) {
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const submit = async (data) => {
    setStatus({ state: "sending", message: "" });
    try {
      await api.createLead({ type, ...data });
      setStatus({ state: "ok", message: "" });
    } catch (e) {
      setStatus({ state: "error", message: e.message });
    }
  };
  return [status, submit];
}

function GuideForm() {
  const [form, setForm] = useState({ name: "", email: "", childAge: "", mainNeed: "" });
  const [status, submit] = useLeadForm("guide");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (status.state === "ok") {
    return (
      <div className="lead-form">
        <h3>¡Listo, {form.name}!</h3>
        <p className="lead-ok show">Te enviaré la guía a <b>{form.email}</b>. Revisa también tu carpeta de spam.</p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={(e) => { e.preventDefault(); submit(form); }}>
      <h3>Descarga tu guía gratuita</h3>
      <div className="field"><label htmlFor="gName">Nombre</label><input id="gName" required value={form.name} onChange={set("name")} placeholder="Tu nombre" /></div>
      <div className="field"><label htmlFor="gMail">Correo electrónico</label><input id="gMail" type="email" required value={form.email} onChange={set("email")} placeholder="tucorreo@ejemplo.com" /></div>
      <div className="field"><label htmlFor="gAge">Edad del niño</label><input id="gAge" value={form.childAge} onChange={set("childAge")} placeholder="Ej. 18 meses" /></div>
      <div className="field"><label htmlFor="gNeed">Principal dificultad actual</label><input id="gNeed" value={form.mainNeed} onChange={set("mainNeed")} placeholder="Ej. berrinches, sueño, límites…" /></div>
      <button className="btn btn-clay lead-submit" disabled={status.state === "sending"}>
        {status.state === "sending" ? "Enviando…" : "Descargar guía gratis"}
      </button>
      {status.state === "error" && <p className="lead-ok show lead-error">{status.message}</p>}
    </form>
  );
}

function SchoolForm() {
  const [email, setEmail] = useState("");
  const [status, submit] = useLeadForm("school");

  if (status.state === "ok") {
    return <p className="lead-ok show school-ok">¡Gracias por tu interés! Te avisaremos con las primeras novedades de la escuela.</p>;
  }
  return (
    <form className="school-form" onSubmit={(e) => { e.preventDefault(); submit({ email }); }}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" aria-label="Correo electrónico" />
      <button className="btn btn-clay" disabled={status.state === "sending"}>Unirme a la lista de interés</button>
      {status.state === "error" && <p className="school-error">{status.message}</p>}
    </form>
  );
}

export default function LandingPage() {
  const { user, isAdmin } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [openQuote, setOpenQuote] = useState(null);

  useEffect(() => {
    api.getContent().then((d) => setQuotes(d.quotes || [])).catch(() => {});
  }, []);

  const reserveTo = user ? (isAdmin ? "/admin" : "/citas/nueva") : "/registro";
  const pricingAction = (plan, className) => (
    <Link to={reserveTo} className={className}>{plan.firstTimeOnly ? "Agendar mi sesión gratis" : "Reservar →"}</Link>
  );

  return (
    <div className="app-shell">
      <div className="annbar">
        <Link to={reserveTo}><GiftIcon /> ¿Primera vez? Tu primera asesoría de 30 min es GRATIS — agéndala aquí</Link>
      </div>
      <Header />

      <section className="hero" style={{ padding: 0 }} id="inicio">
        <div className="wrap hero-grid">
          <Reveal>
            <span className="eyebrow">Acompañamiento Montessori para familias</span>
            <h1>Montessori para <em>la vida real</em></h1>
            <p className="lead">
              Acompaño a familias con niños de 0 a 3 años a fomentar la autonomía, establecer límites respetuosos y preparar su hogar desde una mirada Montessori.
            </p>
            <p className="intro">Soy Adriana Villalobos, guía Montessori AMI 0–3 y mamá mexicana criando en Japón.</p>
            <div className="hero-cta">
              <Link to={reserveTo} className="btn btn-primary">Reservar asesoría</Link>
              <a href="#recursos" className="btn btn-ghost">Descargar guía gratuita</a>
            </div>
            <div className="free-callout"><GiftIcon /> Primera asesoría de 30 min GRATIS · solo primera vez</div>
            <div className="credchips">
              <span className="chip">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                Guía Montessori AMI 0–3 · diploma en proceso de emisión
              </span>
              <span className="chip">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                Sesiones 100% en línea
              </span>
            </div>
          </Reveal>
          <div className="hero-photo reveal in">
            <div className="framed"><img src={IMAGES.hero} alt="Adriana acompañando a una niña en una actividad de vida práctica" /></div>
            <div className="float-tag">
              <div className="dot">♥</div>
              <span>Soluciones prácticas para hogares reales.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="areas">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">Áreas de acompañamiento</span>
            <h2>En qué te puedo ayudar</h2>
            <p>Trabajo contigo lo que tu familia necesita hoy, con soluciones concretas y adaptadas a tu casa y tu ritmo.</p>
          </div>
          <div className="cards cards-3">
            {AREAS.map((a) => (
              <div key={a.t} className="card">
                <div className="ic"><Icon paths={a.i} /></div>
                <h3>{a.t}</h3>
                <p>{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="tint">
        <div className="wrap about-grid">
          <div className="about-photo reveal in">
            <div className="framed"><img src={IMAGES.about} alt="Adriana Villalobos" /></div>
            <div className="about-route" aria-label="Maternidad entre México, Estados Unidos y Japón">
              <span>México</span><i>→</i><span>Estados Unidos</span><i>→</i><span>Japón</span>
            </div>
          </div>
          <div className="about-text reveal in">
            <span className="eyebrow">Sobre mí</span>
            <h2>Hola, soy Adriana</h2>
            <p className="about-lead">
              Mamá mexicana viviendo en Japón, ingeniera aeronáutica, profesional en vinculación internacional,
              anteriormente fundé una empresa de impacto social en México y soy guía AMI Montessori 0–3.
            </p>
            <p>
              Mi trabajo nace de una idea muy simple: para acompañar bien a nuestros hijos, también necesitamos aprender
              a acompañarnos a nosotras mismas.
            </p>

            <div className="about-focus">
              <div>
                <h3>Acompaño a tu hijo</h3>
                <p>
                  Acompaño a mamás y familias a comprender mejor el desarrollo de sus hijos, favorecer su independencia,
                  establecer rutinas y límites respetuosos, preparar ambientes en casa y atravesar procesos importantes
                  como el desarrollo emocional, el lenguaje, el movimiento, la adaptación escolar o dejar el pañal.
                </p>
              </div>
              <div>
                <h3>Y también a ti, mamá</h3>
                <p>
                  Pero mi acompañamiento no se queda solo en el niño. También quiero crear un espacio para la mamá: para
                  hablar de cansancio, culpa, identidad, bienestar físico y emocional, sueños, relaciones, trabajo,
                  independencia y todo lo que también cambia cuando nos convertimos en madres.
                </p>
              </div>
            </div>

            <p>
              Creo profundamente que no podemos dar lo que no tenemos. Por eso trabajar en nosotras, conocernos, cuidarnos
              y sentirnos sostenidas también forma parte de la crianza.
            </p>
            <p>
              Quiero construir una comunidad donde ninguna mamá sienta que tiene que hacerlo todo sola: un lugar para
              compartir experiencias, aprender juntas, encontrar herramientas y, cuando sea necesario, poder orientarse
              hacia especialistas adecuados tanto para mamá como para hijo.
            </p>
            <p>
              Mi propia maternidad la he vivido entre México, Estados Unidos y Japón, criando a mi hija en culturas, idiomas
              y formas de educar diferentes. Esa experiencia me ha enseñado a observar, cuestionar y tomar de cada entorno
              aquello que considero mejor para nuestra familia.
            </p>
            <p>
              No busco enseñar una maternidad perfecta. Quiero compartir lo que he estudiado, lo que he vivido, lo que me ha
              servido y también lo que he tenido que aprender en el camino, para ayudarte a construir una maternidad más
              consciente, una relación más conectada con tus hijos y una vida en la que tú también sigas existiendo.
            </p>
            <blockquote className="about-quote">
              Porque nuestros hijos necesitan una mamá que los acompañe, pero las mamás también necesitamos sentirnos acompañadas.
            </blockquote>
            <p className="sign">— Adriana Villalobos Silva</p>
          </div>
        </div>
      </section>

      <section id="ayuda">
        <div className="wrap concerns">
          <div className="reveal in">
            <span className="eyebrow">Cómo te ayudo</span>
            <h2 style={{ fontSize: "clamp(1.9rem,3.4vw,2.7rem)", margin: ".7rem 0 1rem" }}>¿Te suena familiar?</h2>
            <p style={{ color: "var(--muted)", marginBottom: 22 }}>
              Toca cada frase para ver cómo la abordamos. Detrás de cada conducta casi siempre hay una necesidad que podemos entender.
            </p>
            <div className="quote-list">
              {quotes.map((q, i) => (
                <div
                  key={q.q}
                  className={`q${openQuote === i ? " open" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenQuote(openQuote === i ? null : i)}
                  onKeyDown={(e) => e.key === "Enter" && setOpenQuote(openQuote === i ? null : i)}
                >
                  <div className="said">{q.q}</div>
                  <div className="ans">{q.a}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="concern-photo reveal in">
            <div className="framed"><img src={IMAGES.concern} alt="Adriana trabajando con un niño pequeño" /></div>
          </div>
        </div>
      </section>

      <section id="asesorias" className="tint">
        <div className="wrap">
          <div className="sec-head center reveal in">
            <span className="eyebrow">Asesorías Montessori 0–3</span>
            <h2>Elige el acompañamiento que necesitas</h2>
            <p>Sesiones individuales en línea. Empezamos por observar a tu hijo y salimos con cambios concretos que puedes aplicar de inmediato.</p>
          </div>
          <PricingGrid action={pricingAction} />
        </div>
      </section>

      <section id="proceso">
        <div className="wrap">
          <div className="sec-head center reveal in">
            <span className="eyebrow">Cómo funciona</span>
            <h2>Reservar es muy sencillo</h2>
            <p>Un proceso claro, de principio a fin, para que llegues a la sesión con todo listo. Si es tu primera vez, tu sesión de 30 min es gratis y omites el pago.</p>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.t} className="step">
                <span className="n">{i + 1}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="steps-cta">
            <Link to={reserveTo} className="btn btn-primary">Reservar asesoría</Link>
          </div>
        </div>
      </section>

      <section id="galeria" className="tint">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">En acción</span>
            <h2>Aprendizaje real, en ambientes preparados</h2>
            <p>Momentos de trabajo, concentración y vida práctica junto a niños, familias y guías en distintos contextos.</p>
          </div>

          <div className="gallery-block reveal in">
            <div className="gallery-story">
              <span className="eyebrow">Experiencia en Japón</span>
              <h3>Ambientes Montessori y una mirada que cruza culturas</h3>
              <p>
                Viví y trabajé en Japón en ambientes Montessori 0–3, junto a guías AMI y equipos educativos japoneses.
                Observé cómo los niños crecen en espacios ordenados, serenos y profundamente respetuosos de su ritmo.
              </p>
              <p>
                Esa experiencia sumó a mi formación la disciplina como autoregulación, la atención al detalle en el ambiente,
                la paciencia en la observación y el valor del trabajo bien hecho — principios que comparten Montessori y la
                enseñanza japonesa, y que hoy integro al acompañamiento de las familias en línea.
              </p>
            </div>
            <div className="gallery gallery-japan">
              <div className="framed">
                <img src={IMAGES.galleryJapan[0]} alt="Niña concentrada en una actividad con figuras de fieltro" loading="lazy" />
              </div>
              <div className="framed">
                <img src={IMAGES.galleryJapan[1]} alt="Adriana junto a dos guías en Japón" loading="lazy" />
              </div>
            </div>
          </div>

          <div className="gallery-features reveal in">
            <article className="gallery-feature">
              <div className="framed gallery-feature-photo">
                <img src={IMAGES.galleryMusic} alt="Niña explorando el piano en casa" loading="lazy" />
              </div>
              <div className="gallery-feature-text">
                <span className="eyebrow">Montessori y música</span>
                <h3>Concentración, coordinación y expresión</h3>
                <p>
                  La música no es solo una actividad extra: en Montessori es una vía para desarrollar atención, motricidad fina,
                  lenguaje y expresión emocional. Acompaño a las familias a ofrecer experiencias musicales accesibles en casa —
                  con instrumentos reales, ritmo sin presión y la libertad de explorar dentro de límites claros y respetuosos.
                </p>
              </div>
            </article>

            <article className="gallery-feature gallery-feature--reverse">
              <div className="framed gallery-feature-photo">
                <img src={IMAGES.gallerySports} alt="Niño nadando con acompañamiento respetuoso" loading="lazy" />
              </div>
              <div className="gallery-feature-text">
                <span className="eyebrow">Montessori y deporte</span>
                <h3>Movimiento, confianza y autonomía</h3>
                <p>
                  El movimiento fortalece el cuerpo, la confianza y la autonomía del niño. Desde la mirada Montessori, nadar,
                  correr o explorar el agua son oportunidades para que conozca sus límites, practique persistencia y viva la
                  alegría de moverse con seguridad — siempre respetando su ritmo y sin forzar logros prematuros.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="mi-camino">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">Mi camino</span>
            <h2>Experiencias, congresos y aprendizajes</h2>
            <p>Los eventos, formaciones y encuentros que siguen nutriendo mi manera de acompañar a las familias.</p>
          </div>
          <div className="journey-grid reveal in">
            {posts.map((post) => <JourneyCard key={post.slug} post={post} />)}
          </div>
        </div>
      </section>

      <section id="testimonios" className="tint">
        <div className="wrap">
          <div className="sec-head center reveal in">
            <span className="eyebrow">Familias acompañadas</span>
            <h2>Lo que dicen las familias</h2>
          </div>
          <div className="testi-grid">
            {testimonials.map((t) => (
              <div key={t.who} className="testi">
                <div className="stars" aria-label="5 de 5">★★★★★</div>
                <p>“{t.text}”</p>
                <div className="who">{t.who}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="formacion">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">Formación y certificaciones</span>
            <h2>Respaldo Montessori internacional</h2>
            <p>Mi acompañamiento se apoya en formación reconocida por la Association Montessori Internationale (AMI), fundada por Maria Montessori en 1929.</p>
          </div>
          <div className="creds creds-3 reveal in">
            {CREDS.map((c) => (
              <div key={c.src} className="cred-card">
                <img src={c.src} alt={c.alt} loading="lazy" />
                <div className="meta">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="2" style={{ flex: "none" }}><circle cx="12" cy="8" r="6" /><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" /></svg>
                  <div><b>{c.title}</b><br />{c.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="lead-band">
        <div className="wrap lead-grid">
          <div className="reveal in">
            <span className="eyebrow">Recurso gratuito</span>
            <h2>25 cambios Montessori que puedes hacer en casa sin comprar materiales caros</h2>
            <p>Una guía práctica para empezar hoy mismo, con ideas sencillas que transforman la vida diaria con tu hijo de 0 a 3 años.</p>
            <p style={{ fontSize: ".9rem", color: "var(--muted)" }}>
              Déjame tus datos y te la envío por correo.<br />Blog y más recursos: <b>próximamente</b>.
            </p>
          </div>
          <GuideForm />
        </div>
      </section>

      <section id="escuela" className="school">
        <div className="wrap">
          <span className="eyebrow">Visión a futuro</span>
          <h2>Construyendo una escuela Montessori internacional en Osaka</h2>
          <p>
            Sueño con una comunidad Montessori internacional que acompañe a niños y familias en un ambiente multicultural y trilingüe.
            Si te gustaría formar parte, déjame tus datos y te avisaré primero.
          </p>
          <span className="coming">Montessori International School Osaka · Coming 2027</span>
          <SchoolForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
