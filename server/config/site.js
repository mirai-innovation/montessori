/**
 * URL pública del sitio para enlaces en correos y redirecciones de Stripe.
 * En Vercel se ignora un FRONTEND_URL que apunte a localhost (valor copiado del .env local)
 * y se usa el dominio de producción del proyecto.
 */
export function siteUrl() {
  const configured = (process.env.SITE_URL || process.env.FRONTEND_URL || "").trim();
  const isLocal = /localhost|127\.0\.0\.1/.test(configured);
  let url = configured;
  if (!url || (isLocal && process.env.VERCEL)) {
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    url = host ? `https://${host}` : "http://localhost:5173";
  }
  return url.replace(/\/$/, "");
}
