import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { useAuth } from "../contexts/AuthContext";
import { changePassword } from "../lib/api";
import { PASSWORD_POLICY_HINT } from "../lib/authErrors";
import "../styles/pages.css";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (busy) return;
    if (!current) {
      setError("Ingresa tu contraseña actual.");
      return;
    }
    if (next.length < 8) {
      setError(PASSWORD_POLICY_HINT);
      return;
    }
    if (next !== confirm) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    setBusy(true);
    setError(null);
    const err = await changePassword({
      email: user?.email ?? "",
      currentPassword: current,
      newPassword: next,
    });
    if (err) {
      setError(err);
      setBusy(false);
      return;
    }
    setDone(true);
    setCurrent("");
    setNext("");
    setConfirm("");
    // Muestra la confirmación y luego cierra TODAS las sesiones (incluida esta)
    await new Promise((resolve) => setTimeout(resolve, 1600));
    await signOut();
  }

  return (
    <div>
      <div className="pc-page-header">
        <button type="button" className="pc-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          ‹
        </button>
        <h1 className="pc-title">Cambiar contraseña</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="pc-form-card">
        <div className="pc-field">
          <label className="pc-field-label" htmlFor="current-pass">
            Contraseña actual
          </label>
          <input
            id="current-pass"
            className="pc-input"
            type="password"
            placeholder="Ingresa tu contraseña actual"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="new-pass">
            Nueva contraseña
          </label>
          <input
            id="new-pass"
            className="pc-input"
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <p className="pc-muted location-help">{PASSWORD_POLICY_HINT}</p>
        </div>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="confirm-new-pass">
            Confirma la nueva contraseña
          </label>
          <input
            id="confirm-new-pass"
            className="pc-input"
            type="password"
            placeholder="Repite la nueva contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {error && (
          <p className="pc-error-text" role="alert">
            {error}
          </p>
        )}
        {done && (
          <p className="auth-page__notice" role="status">
            ¡Contraseña cambiada correctamente! Por seguridad cerramos la sesión en todos tus
            dispositivos, incluida esta.
          </p>
        )}

        <p className="pc-muted location-help">
          Después de cambiarla, cerraremos la sesión en todos tus dispositivos (incluida esta) y
          deberás iniciar sesión con la nueva contraseña.
        </p>

        <div className="pc-form-actions">
          <PrimaryButton onClick={() => void submit()} type="button" disabled={busy}>
            {busy ? (done ? "Cerrando sesión…" : "Guardando…") : "Guardar cambios"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
