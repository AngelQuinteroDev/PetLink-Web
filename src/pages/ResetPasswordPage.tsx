import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import PawHeartLogo from "../components/PawHeartLogo.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { LoadingState } from "../components/ui/States";
import { useAuth } from "../contexts/AuthContext";
import { setNewPassword } from "../lib/api";
import "../styles/auth.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (password.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    setBusy(true);
    setError(null);
    const err = await setNewPassword(password);
    setBusy(false);
    if (err) {
      setError("No pudimos actualizar tu contraseña. Solicita un enlace nuevo.");
      return;
    }
    setDone(true);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <LoadingState label="Verificando tu enlace…" />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page__hero">
        <PawHeartLogo />
        <h1 className="auth-page__title">Nueva contraseña</h1>
        <p className="auth-page__subtitle">Elige una contraseña segura</p>
      </div>

      {!session && !done && (
        <>
          <p className="pc-error-text auth-page__error" role="alert">
            El enlace expiró o no es válido. Solicita uno nuevo.
          </p>
          <PrimaryButton onClick={() => navigate("/recuperar")} type="button">
            Solicitar nuevo enlace
          </PrimaryButton>
        </>
      )}

      {session && !done && (
        <div className="login-card">
          <div className="login-card__completa">
            <div className="login-card__btn-group">
              <div className="login-card__inputs">
                <label className="pc-field-label" htmlFor="new-password">
                  Nueva contraseña
                </label>
                <input
                  id="new-password"
                  className="pc-input"
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <label className="pc-field-label" htmlFor="confirm-password">
                  Confirma la contraseña
                </label>
                <input
                  id="confirm-password"
                  className="pc-input"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="pc-error-text" role="alert">
                  {error}
                </p>
              )}

              <PrimaryButton onClick={() => void submit()} type="button">
                {busy ? "Guardando…" : "Guardar contraseña"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {done && (
        <>
          <p className="auth-page__notice" role="status">
            <ShieldCheck size={16} /> ¡Contraseña actualizada! Ya puedes usar tu cuenta.
          </p>
          <PrimaryButton onClick={() => navigate("/")} type="button">
            Ir al inicio
          </PrimaryButton>
        </>
      )}
    </div>
  );
}
