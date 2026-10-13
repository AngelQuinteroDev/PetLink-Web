import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import { LoadingState } from "./components/ui/States";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import ReportPage from "./pages/ReportPage";
import MiPetReportPage from "./pages/MiPetReportPage";
import FoundPetReportPage from "./pages/FoundPetReportPage";
import AdoptionPetPage from "./pages/AdoptionPetPage";
import CommunityPage from "./pages/CommunityPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import PetFormPage from "./pages/PetFormPage";
import ChangeEmailPage from "./pages/ChangeEmailPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AyudaPage from "./pages/AyudaPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import VetApplicationPage from "./pages/VetApplicationPage";
import MyClinicPage from "./pages/MyClinicPage";
import RequestResetPage from "./pages/RequestResetPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LegalPage from "./pages/LegalPage";
import PetListPage from "./pages/PetListPage";

function FullLoading() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <LoadingState label="Iniciando PetClue…" />
    </div>
  );
}

function ProtectedArea({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicArea({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullLoading />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminArea({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <FullLoading />;
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicArea>
                <LoginPage />
              </PublicArea>
            }
          />
          <Route
            path="/registro"
            element={
              <PublicArea>
                <RegisterPage />
              </PublicArea>
            }
          />
          <Route
            path="/recuperar"
            element={
              <PublicArea>
                <RequestResetPage />
              </PublicArea>
            }
          />
          <Route path="/restablecer" element={<ResetPasswordPage />} />
          <Route path="/terminos" element={<LegalPage doc="terms" />} />
          <Route path="/privacidad" element={<LegalPage doc="privacy" />} />
          <Route
            element={
              <ProtectedArea>
                <AppLayout />
              </ProtectedArea>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/reportar" element={<ReportPage />} />
            <Route path="/reportar/mi-mascota" element={<MiPetReportPage />} />
            <Route path="/reportar/encontrada" element={<FoundPetReportPage />} />
            <Route path="/reportar/adopcion" element={<AdoptionPetPage />} />
            <Route path="/comunidad" element={<CommunityPage />} />
            <Route path="/adopcion" element={<PetListPage mode="adoption" />} />
            <Route path="/encontrados" element={<PetListPage mode="found" />} />
            <Route path="/notificaciones" element={<NotificationsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/mascotas/nueva" element={<PetFormPage />} />
            <Route path="/mascotas/:id/editar" element={<PetFormPage />} />
            <Route path="/ajustes" element={<SettingsPage />} />
            <Route path="/configuracion/correo" element={<ChangeEmailPage />} />
            <Route path="/configuracion/contrasena" element={<ChangePasswordPage />} />
            <Route path="/ayuda" element={<AyudaPage />} />
            <Route path="/verificacion" element={<VetApplicationPage />} />
            <Route path="/mi-clinica" element={<MyClinicPage />} />
            <Route
              path="/admin"
              element={
                <AdminArea>
                  <AdminPage />
                </AdminArea>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
