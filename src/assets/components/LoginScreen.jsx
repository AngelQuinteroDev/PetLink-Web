import { useState } from "react";
import AuthField from "./AuthField.jsx";
import AuthLogo from "./AuthLogo.jsx";
import "./AuthPages.css";

const stroke = { stroke: "#66557E", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

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

function LoginScreen({ onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const canSubmit = email.trim() !== "" && password !== "";

  return (
    <div className="auth-page">
      <div className="auth-page__back-spacer" />

      <AuthLogo />

      <h1 className="auth-title">Bienvenido de vuelta</h1>
      <p className="auth-subtitle">Inicia sesión</p>

      <form
        className="auth-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onLoginSuccess?.(email.trim());
        }}
      >
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
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <div className="auth-row">
          <label className="auth-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Recordarme
          </label>

          <button type="button" className="auth-link" onClick={() => console.log("Recuperar contraseña")}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button type="submit" className="auth-submit" disabled={!canSubmit}>
          Iniciar sesión
        </button>

        <p className="auth-switch">
          ¿No tienes cuenta?{" "}
          <button type="button" className="auth-link" onClick={onSwitchToRegister}>
            Regístrate
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginScreen;