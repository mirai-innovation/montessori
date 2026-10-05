import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ComoFuncionaPage from "./pages/ComoFuncionaPage";
import PrivacidadPage from "./pages/PrivacidadPage";
import PreciosPage from "./pages/PreciosPage";
import JourneyPostPage from "./pages/JourneyPostPage";
import UserLayout from "./pages/user/UserLayout";
import DashboardPage from "./pages/user/DashboardPage";
import ProfilePage from "./pages/user/ProfilePage";
import AppointmentsPage from "./pages/user/AppointmentsPage";
import NewAppointmentPage from "./pages/user/NewAppointmentPage";
import SessionNotesPage from "./pages/user/SessionNotesPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";
import AdminAgendaPage from "./pages/admin/AdminAgendaPage";
import AdminFamiliesPage from "./pages/admin/AdminFamiliesPage";
import AdminFamilyDetailPage from "./pages/admin/AdminFamilyDetailPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminLeadsPage from "./pages/admin/AdminLeadsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/como-funciona" element={<ComoFuncionaPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/precios" element={<PreciosPage />} />
          <Route path="/mi-camino/:slug" element={<JourneyPostPage />} />

          <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="citas" element={<AppointmentsPage />} />
            <Route path="citas/nueva" element={<NewAppointmentPage />} />
            <Route path="sesiones" element={<SessionNotesPage />} />
            <Route path="sesiones/:id" element={<SessionNotesPage />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="citas" element={<AdminAppointmentsPage />} />
            <Route path="agenda" element={<AdminAgendaPage />} />
            <Route path="familias" element={<AdminFamiliesPage />} />
            <Route path="familias/:id" element={<AdminFamilyDetailPage />} />
            <Route path="ingresos" element={<AdminPaymentsPage />} />
            <Route path="interesados" element={<AdminLeadsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
