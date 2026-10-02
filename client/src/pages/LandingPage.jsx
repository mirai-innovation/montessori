import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header, Footer, Reveal } from "../components/Layout";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { JourneyCard } from "../components/Journey";
import { journeyPosts } from "../../../shared/content.js";

const IMAGES = {
  hero: "/assets/hero.jpg",
  about: "/assets/about.jpg",
  concern: "/assets/concern.jpg",
  galleryJapan: ["/assets/gallery-1.jpg", "/assets/gallery-2.jpg", "/assets/gallery-3.jpg"],
  galleryMusic: "/assets/gallery-music.png",
  gallerySports: "/assets/gallery-sports.png",
  creds: ["/assets/cred-1.jpg", "/assets/cred-2.jpg"],
};

const posts = journeyPosts.filter((p) => p.published);

export default function LandingPage() {
  const { user, isAdmin } = useAuth();
  const [services, setServices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [openQuote, setOpenQuote] = useState(null);

  useEffect(() => {
    api.getContent().then((d) => {
      setServices(d.services || []);
      setQuotes(d.quotes || []);
    }).catch(() => {});
  }, []);

  const reserveTo = user ? (isAdmin ? "/admin" : "/citas/nueva") : "/registro";

  return (
    <div className="app-shell">
      <Header />
      <section className="hero" style={{ padding: 0 }} id="inicio">
        <div className="wrap hero-grid">
          <Reveal>
            <span className="eyebrow">Acompañamiento Montessori para familias</span>
            <h1>Los primeros años se viven <em>una sola vez</em></h1>
            <p className="lead">
              Acompaño a mamás, papás y cuidadores de niños de 0 a 3 años a entender el desarrollo de su hijo y aplicar Montessori en casa de forma práctica, amorosa y realista.
            </p>
            <div className="hero-cta">
              <Link to={reserveTo} className="btn btn-primary">Reservar una sesión</Link>
              <a href="#asesorias" className="btn btn-ghost">Ver asesorías</a>
            </div>
            <div className="credchips">
              <span className="chip">Guía AMI Montessori 0–3</span>
              <span className="chip">Sesiones 100% en línea</span>
            </div>
          </Reveal>
          <div className="hero-photo reveal in">
            <div className="framed"><img src={IMAGES.hero} alt="Adriana Villalobos" /></div>
            <div className="float-tag">
              <div className="dot">♥</div>
              <span>Acompañamiento personalizado para tu familia</span>
            </div>
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

      <section id="asesorias">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">Asesorías personalizadas</span>
            <h2>En qué te puedo acompañar</h2>
            <p>Áreas concretas de trabajo, pensadas para niños de 0 a 3 años y adaptables a la etapa preescolar. Cada sesión parte de la observación y de lo que tu familia necesita hoy.</p>
          </div>
          <div className="cards">
            {services.map((s) => (
              <div key={s.t} className="card">
                <div className="ic">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <g dangerouslySetInnerHTML={{ __html: s.i }} />
                  </svg>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ayuda" className="tint">
        <div className="wrap concerns">
          <div className="reveal in">
            <span className="eyebrow">Cómo te ayudo</span>
            <h2 style={{ fontSize: "clamp(1.9rem,3.4vw,2.7rem)", margin: ".7rem 0 1rem" }}>¿Te suena familiar?</h2>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>Toca cada frase para ver cómo la abordamos desde una mirada Montessori.</p>
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
            <div className="framed"><img src={IMAGES.concern} alt="Acompañamiento familiar" /></div>
          </div>
        </div>
      </section>

      <section id="galeria">
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
              <div className="framed tall">
                <img src={IMAGES.galleryJapan[0]} alt="Niños en ambiente Montessori en Japón" loading="lazy" />
              </div>
              <div className="framed">
                <img src={IMAGES.galleryJapan[1]} alt="Guías Montessori en Japón" loading="lazy" />
              </div>
              <div className="framed">
                <img src={IMAGES.galleryJapan[2]} alt="Maestras y niños en Japón" loading="lazy" />
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

      <section id="formacion" className="tint">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">Formación y certificaciones</span>
            <h2>Respaldo Montessori internacional</h2>
            <p>Mi acompañamiento se apoya en formación reconocida por la Association Montessori Internationale (AMI), fundada por Maria Montessori en 1929.</p>
          </div>
          <div className="creds reveal in">
            {IMAGES.creds.map((src, i) => (
              <div key={src} className="cred-card">
                <img src={src} alt={`Certificación ${i + 1}`} loading="lazy" />
                <div className="meta"><b>Formación AMI</b> · Montessori 0–3</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reservar">
        <div className="wrap">
          <div className="sec-head reveal in">
            <span className="eyebrow">Agenda tu sesión</span>
            <h2>Reserva tu asesoría en línea</h2>
            <p>Crea tu cuenta, completa el perfil de tu familia y elige el día y la hora que mejor te queden.</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link to={reserveTo} className="btn btn-primary">Ir a reservar</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
