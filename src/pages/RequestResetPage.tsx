import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import PawHeartLogo from "../components/PawHeartLogo.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { requestPasswordReset } from "../lib/api";
import "../styles/auth.css";

export default function RequestResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!email.includes("@") || email.trim().length < 5) {
      setError("Escribe un correo válido.");
      return;
    }
    setBusy(true);
    setError(null);
    const err = await requestPasswordReset(email.trim());
    setBusy(false);
    if (err) {
      setError("No pudimos enviar el enlace. Intenta de nuevo en unos minutos.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="auth-page">
      <button
        type="button"
        className="auth-page__back"
        onClick={() => navigate("/login")}
        aria-label="Volver"
      >
        ‹
      </button>

      <div className="auth-page__hero">
        <PawHeartLogo />
        <h1 className="auth-page__title">Recupera tu cuenta</h1>
        <p className="auth-page__subtitle">Te enviaremos un enlace a tu correo</p>
      </div>

      {sent ? (
        <p className="auth-page__notice" role="status">
          <MailCheck size={16} /> Si ese correo tiene una cuenta, te enviamos un enlace para
          restablecer tu contraseña. Revisa tu bandeja y la carpeta de spam.
        </p>
      ) : (
        <div className="login-card">
          <div className="login-card__completa">
            <div className="login-card__btn-group">
              <div className="login-card__inputs">
                <label className="pc-field-label" htmlFor="reset-email">
                  Correo electrónico
                </label>
                <input
                  id="reset-email"
                  className="pc-input"
                  type="email"
                  placeholder="nombre@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {error && (
                <p className="pc-error-text" role="alert">
                  {error}
                </p>
              )}

              <PrimaryButton onClick={() => void submit()} type="button">
                {busy ? "Enviando…" : "Enviar enlace"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
