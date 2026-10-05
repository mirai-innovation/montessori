# Montessori en Casa — Plataforma Adriana Villalobos

Plataforma completa con landing pública, autenticación, dashboard de familias, sistema de citas, notas de sesión y panel admin.

## Stack

- **Frontend:** React + Vite + React Router
- **Backend:** Node.js + Express + MongoDB
- **Auth:** JWT + bcrypt

## Inicio rápido

### 1. Requisitos

- Node.js 18+
- MongoDB local o Atlas

### 2. Instalar

```bash
cp .env.example .env
npm install
```

### 3. Sembrar admin y disponibilidad

```bash
npm run seed -w server
```

Credenciales por defecto (cambiar en `.env`):

- Email: `adriana@ejemplo.com`
- Password: `Admin123!`

> **Importante:** El servidor debe mostrar `✅ MongoDB conectado` al arrancar. Si no, registro y login no funcionarán.

### 4. Desarrollo

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5001

Verifica conexión: http://localhost:5001/api/health → debe responder `{"ok":true,"db":"connected"}`

## Solución de problemas

### No puedo registrarme ni iniciar sesión

1. **Revisa la terminal del servidor** — debe decir `✅ MongoDB conectado` antes de `🚀 Servidor en...`
2. **Si usas localhost** — MongoDB debe estar instalado y corriendo:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```
3. **Si usas MongoDB Atlas** — en `.env`:
   ```
   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/montessori?retryWrites=true&w=majority
   ```
   - En Atlas → Network Access → agrega tu IP (o `0.0.0.0/0` para desarrollo)
   - Si la contraseña tiene caracteres especiales, codifícala en URL (ej. `@` → `%40`)
4. **Reinicia todo** después de cambiar `.env`:
   ```bash
   npm run seed -w server
   npm run dev
   ```

### 5. Producción

```bash
npm run build
npm start
```

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing pública |
| `/registro`, `/login` | Autenticación |
| `/dashboard` | Panel familia |
| `/citas/nueva` | Reservar sesión |
| `/sesiones` | Notas de sesión |
| `/perfil` | Perfil del niño/a |
| `/admin` | Panel Adriana |

## Producción (Vercel — todo en uno)

Guía completa en **[DEPLOY.md](DEPLOY.md)**.

- **Un solo proyecto Vercel** en la raíz del repo (no solo `client/`)
- API Express en `api/index.js` → rutas `/api/*`
- MongoDB Atlas obligatorio en producción
- `npm run seed` una vez antes o después del primer deploy

## Fase 2 — Stripe

Configura en `.env`:

```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Los precios de las asesorías se definen en `shared/content.js` (`servicePlans`) y se cobran con `price_data`, así que no hace falta crear productos ni precios en Stripe.
