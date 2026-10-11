import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ClipboardList,
  FileText,
  HelpCircle,
  Info,
  KeyRound,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Navigation,
  Trash2,
  UserX,
  Users,
} from "lucide-react";
import SettingsRow from "../components/ui/SettingsRow";
import ToggleSwitch from "../components/ui/ToggleSwitch";
import ConfirmModal from "../components/ui/ConfirmModal";
import LegalModal from "../components/ui/LegalModal";
import CityPickerModal from "../components/ui/CityPickerModal";
import { useAuth } from "../contexts/AuthContext";
import { usePrefs } from "../hooks/usePrefs";
import { useUserLocation } from "../hooks/useUserLocation";
import "../styles/pages.css";
import "../styles/settings.css";

const DISTANCES = [
  { label: "500 m", value: 500 },
  { label: "1 Km", value: 1000 },
  { label: "3 Km", value: 3000 },
  { label: "5 Km", value: 5000 },
];

const APP_VERSION = "v0.1.0";
const SUPPORT_EMAIL = "soporte@petclue.co";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { prefs, setPref } = usePrefs();
  const { radius, consent, requestConsent, saveRadius } = useUserLocation();
  const [cityOpen, setCityOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [danger, setDanger] = useState<null | "deactivate" | "delete">(null);
  const [savingRadius, setSavingRadius] = useState(false);

  async function pickRadius(value: number) {
    setSavingRadius(true);
    try {
      await saveRadius(value);
    } finally {
      setSavingRadius(false);
    }
  }

  function mailSupport(subject: string, body: string) {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="settings-layout">
      <div className="pc-page-header">
        <button
          type="button"
          className="pc-back-btn"
          onClick={() => window.history.back()}
          aria-label="Volver"
        >
          ‹
        </button>
        <h1 className="pc-title">Ajustes</h1>
        <span style={{ width: 42 }} />
      </div>

      {/* ===== Cuenta ===== */}
      <section className="settings-section">
        <h2 className="settings-section__title">Cuenta</h2>
        <div className="settings-card">
          <SettingsRow
            icon={<Mail size={17} />}
            label="Correo electrónico"
            onClick={() => navigate("/configuracion/correo")}
          />
          <SettingsRow
            icon={<KeyRound size={17} />}
            label="Cambiar contraseña"
            onClick={() => navigate("/configuracion/contrasena")}
          />
          <SettingsRow
            icon={<HelpCircle size={17} />}
            label="Ayuda y soporte"
            onClick={() => navigate("/ayuda")}
          />
        </div>
      </section>

      {/* ===== Notificaciones ===== */}
      <section className="settings-section">
        <h2 className="settings-section__title">Notificaciones</h2>
        <div className="settings-card">
          <SettingsRow
            icon={<Bell size={17} />}
            label="Alerta de mascotas cerca"
            right={
              <ToggleSwitch
                checked={prefs.petAlerts}
                onChange={(v) => setPref("petAlerts", v)}
                label="Alerta de mascotas cerca"
              />
            }
          />

          {prefs.petAlerts && (
            <div className="settings-row settings-row--chips">
              <div className="distance-chips">
                {DISTANCES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    className={`distance-chips__chip ${radius === d.value ? "is-active" : ""}`}
                    disabled={savingRadius}
                    onClick={() => void pickRadius(d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <SettingsRow
            icon={<MessageCircle size={17} />}
            label="Respuestas en mis publicaciones"
            right={
              <ToggleSwitch
                checked={prefs.postReplies}
                onChange={(v) => setPref("postReplies", v)}
                label="Respuestas en mis publicaciones"
              />
            }
          />
          <SettingsRow
            icon={<ClipboardList size={17} />}
            label="Actualizaciones de mis reportes"
            right={
              <ToggleSwitch
                checked={prefs.reportUpdates}
                onChange={(v) => setPref("reportUpdates", v)}
                label="Actualizaciones de mis reportes"
              />
            }
          />
        </div>
      </section>

      {/* ===== Privacidad ===== */}
      <section className="settings-section">
        <h2 className="settings-section__title">Privacidad</h2>
        <div className="settings-card">
          <SettingsRow
            icon={<Users size={17} />}
            label="Quién ve mi perfil"
            value="Comunidad"
          />
          <SettingsRow
            icon={<MapPin size={17} />}
            label="Ciudad por defecto"
            value={prefs.city}
            onClick={() => setCityOpen(true)}
          />
          <SettingsRow
            icon={<Navigation size={17} />}
            label="Ubicación exacta"
            sublabel="Si no, se muestra la zona aproximada"
            right={
              <ToggleSwitch
                checked={prefs.exactLocation}
                onChange={(v) => setPref("exactLocation", v)}
                label="Ubicación exacta"
              />
            }
          />
          <SettingsRow
            icon={<MapPin size={17} />}
            label="Permiso de ubicación"
            sublabel={consent ? "Permiso concedido" : "Sin permiso para alertas cercanas"}
            right={
              <button
                type="button"
                className="settings-row__action"
                onClick={() => void requestConsent()}
              >
                {consent ? "Actualizar" : "Dar permiso"}
              </button>
            }
          />
        </div>
      </section>

      {/* ===== Soporte y legal ===== */}
      <section className="settings-section">
        <h2 className="settings-section__title">Soporte y legal</h2>
        <div className="settings-card">
          <SettingsRow
            icon={<Megaphone size={17} />}
            label="Reportar un problema"
            onClick={() => navigate("/ayuda")}
          />
          <SettingsRow
            icon={<FileText size={17} />}
            label="Términos y privacidad"
            onClick={() => setLegalOpen(true)}
          />
          <SettingsRow icon={<Info size={17} />} label="Acerca de PetClue" value={APP_VERSION} />
        </div>
      </section>

      {/* ===== Zona de riesgo ===== */}
      <section className="settings-section">
        <h2 className="settings-section__title">Zona de riesgo</h2>
        <div className="settings-card">
          <SettingsRow
            icon={<UserX size={17} />}
            label="Desactivar cuenta temporalmente"
            danger
            onClick={() => setDanger("deactivate")}
          />
          <SettingsRow
            icon={<Trash2 size={17} />}
            label="Eliminar cuenta"
            danger
            onClick={() => setDanger("delete")}
          />
        </div>
      </section>

      {cityOpen && (
        <CityPickerModal
          value={prefs.city}
          onSelect={(city) => setPref("city", city)}
          onClose={() => setCityOpen(false)}
        />
      )}

      {legalOpen && <LegalModal initial="terms" onClose={() => setLegalOpen(false)} />}

      {danger === "deactivate" && (
        <ConfirmModal
          title="Desactivar cuenta temporalmente"
          confirmLabel="Escribir a soporte"
          onClose={() => setDanger(null)}
          onConfirm={() => {
            mailSupport(
              "Solicitud: desactivar mi cuenta temporalmente",
              `Hola, quiero desactivar temporalmente mi cuenta de PetClue.\n\nCorreo de la cuenta: ${
                user?.email ?? "(mi correo registrado)"
              }\n`
            );
            setDanger(null);
          }}
        >
          <p>
            Tu perfil dejará de ser visible para la comunidad y podrás reactivarlo más adelante.
          </p>
          <p>
            Para proteger tu cuenta, la desactivación la procesa el equipo de soporte. Se abrirá
            tu correo con la solicitud lista para enviar.
          </p>
        </ConfirmModal>
      )}

      {danger === "delete" && (
        <ConfirmModal
          title="Eliminar cuenta"
          confirmLabel="Escribir a soporte"
          danger
          onClose={() => setDanger(null)}
          onConfirm={() => {
            mailSupport(
              "Solicitud: eliminar mi cuenta",
              `Hola, quiero solicitar la eliminación permanente de mi cuenta de PetClue.\n\nCorreo de la cuenta: ${
                user?.email ?? "(mi correo registrado)"
              }\n`
            );
            setDanger(null);
          }}
        >
          <p>
            La eliminación es permanente: perderás el acceso a tu perfil, a la información de tus
            mascotas y a tus publicaciones.
          </p>
          <p>
            La solicitud la procesa el equipo de soporte conforme a la política de privacidad. Se
            abrirá tu correo con la solicitud lista para enviar.
          </p>
        </ConfirmModal>
      )}
    </div>
  );
}
