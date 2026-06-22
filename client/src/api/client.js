const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API = API_BASE ? `${API_BASE}/api` : "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "No se pudo conectar al servidor. Verifica que el backend esté corriendo (npm run dev) y que MongoDB esté conectado."
    );
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 503 && data.db === "disconnected") {
    throw new Error("La base de datos no está conectada. Revisa MONGO_URI en tu archivo .env");
  }

  if (!res.ok) throw new Error(data.message || "Error en la solicitud");
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  getChildProfile: () => request("/profile/child"),
  saveChildProfile: (body) => request("/profile/child", { method: "PUT", body: JSON.stringify(body) }),
  updateAccount: (body) => request("/profile/account", { method: "PUT", body: JSON.stringify(body) }),
  getAvailability: (year, month) => request(`/appointments/availability?year=${year}&month=${month}`),
  createAppointment: (body) => request("/appointments", { method: "POST", body: JSON.stringify(body) }),
  getAppointments: () => request("/appointments"),
  getUpcoming: () => request("/appointments/upcoming"),
  cancelAppointment: (id, reason) => request(`/appointments/${id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  getSessionNotes: () => request("/session-notes"),
  getSessionNote: (id) => request(`/session-notes/${id}`),
  getContent: () => request("/content/services"),
  adminStats: () => request("/admin/stats"),
  adminDashboard: () => request("/admin/dashboard"),
  adminRevenue: () => request("/admin/revenue"),
  adminWeekAgenda: (start) => request(`/admin/agenda/week${start ? `?start=${start}` : ""}`),
  adminAppointments: (status) => request(`/admin/appointments${status ? `?status=${status}` : ""}`),
  adminUpdateAppointment: (id, body) => request(`/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  adminAvailability: () => request("/admin/availability"),
  adminSaveAvailability: (body) => request("/admin/availability", { method: "PUT", body: JSON.stringify(body) }),
  adminUsers: (q) => request(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  adminUser: (id) => request(`/admin/users/${id}`),
  adminUpdateUser: (id, body) => request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  adminGetNote: (appointmentId) => request(`/admin/session-notes/appointment/${appointmentId}`),
  adminSaveNote: (body) => request("/admin/session-notes", { method: "POST", body: JSON.stringify(body) }),
  stripeConfig: () => request("/stripe/config"),
  stripeCheckout: (packageId) => request("/stripe/checkout", { method: "POST", body: JSON.stringify({ packageId }) }),
  bookingCheckout: (body) => request("/stripe/booking-checkout", { method: "POST", body: JSON.stringify(body) }),
  bookingStatus: (sessionId) => request(`/stripe/booking-status?session_id=${encodeURIComponent(sessionId)}`),
};
