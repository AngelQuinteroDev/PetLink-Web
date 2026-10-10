import { useState } from "react";
import AuthField from "./AuthField.jsx";
import AuthLogo from "./AuthLogo.jsx";
import CircleIconButton from "../shared/CircleIconButton.jsx";
import PermissionsModal from "../shared/PermissionsModal.jsx";
import SuccessToast from "../shared/SuccessToast.jsx";
import LegalModal from "../shared/LegalModal.jsx";
import backIcon from "../../svg/Back.svg";
import "./AuthPages.css";

const stroke = { stroke: "#66557E", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" {...stroke} />
    <path d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21" {...stroke} />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
    <path d="M3 7L12 13L21 7" {...stroke} />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <rect x="5" y="11" width="14" height="9" rx="2" {...stroke} />
    <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" {...stroke} />
  </svg>
);

function RegisterScreen({ onBack, onSwitchToLogin, onRegisterSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [created, setCreated] = useState(false);
  const [legal, setLegal] = useState(null); // "terms" | "privacy" | null

  const canSubmit = name.trim() !== "" && email.trim() !== "" && password.length >= 6 && accepted;

  const finish = () => {
    setPermOpen(false);
    setCreated(true);
  };

  const afterToast = () => {
    setCreated(false);
    if (onRegisterSuccess) onRegisterSuccess({ name, email });
    else onSwitchToLogin?.();
  };

  return (
    <div className="auth-page">
      <SuccessToast open={created} message="¡Cuenta creada exitosamente!" onDone={afterToast} />

      <div className="auth-page__back">
        <CircleIconButton icon={backIcon} iconAlt="Volver" ariaLabel="Volver" onClick={onBack} />
      </div>

      <AuthLogo />

      <h1 className="auth-title">Crea tu cuenta</h1>
      <p className="auth-subtitle">¡Únete a nuestra comunidad!</p>

      <form
        className="auth-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) setPermOpen(true);
        }}
      >
        <AuthField
          label="Nombre"
          icon={<UserIcon />}
          placeholder="¿Cómo te llamas?"
          autoComplete="name"
          value={name}
          onChange={setName}
        />

        <AuthField
          label="Correo electrónico"
          icon={<MailIcon />}
          type="email"
          placeholder="nombre@correo.com"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />

        <AuthField
          label="Contraseña"
          icon={<LockIcon />}
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />

        <div className="auth-check">
          <input
            id="accept-terms"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>
            Acepto los{" "}
            <button type="button" className="auth-link auth-link--soft" onClick={() => setLegal("terms")}>
              Términos de uso
            </button>{" "}
            y la{" "}
            <button type="button" className="auth-link auth-link--soft" onClick={() => setLegal("privacy")}>
              Política de privacidad
            </button>{" "}
            de PetClue.
          </span>
        </div>

        <button type="submit" className="auth-submit" disabled={!canSubmit}>
          Crear cuenta
        </button>

        <p className="auth-switch">
          ¿Ya tienes cuenta?{" "}
          <button type="button" className="auth-link" onClick={onSwitchToLogin}>
            Inicia sesión
          </button>
        </p>
      </form>

      <PermissionsModal open={permOpen} onClose={() => setPermOpen(false)} onConfirm={finish} />
      <LegalModal type={legal} onClose={() => setLegal(null)} />
    </div>
  );
}

export default RegisterScreen;