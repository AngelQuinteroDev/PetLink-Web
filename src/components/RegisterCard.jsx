import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import FormField from "./FormField.jsx";
import PrimaryButton from "./PrimaryButton.jsx";
import LegalModal from "./ui/LegalModal";
import "./LoginCard.css";

function RegisterCard({ onSwitchToLogin, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [legal, setLegal] = useState(null);

  const handleSubmit = () => {
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }
    onSubmit?.({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <>
      <div className="login-card">
        <div className="login-card__completa">
          <div className="login-card__btn-group">
            <div className="login-card__superior">
              <div className="login-card__inputs">
                <FormField
                  label="Nombre"
                  icon={<User size={16} />}
                  placeholder="¿Cómo te llamas?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormField
                  label="Correo electrónico"
                  icon={<Mail size={16} />}
                  type="email"
                  placeholder="nombre@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              <FormField
                label="Contraseña"
                icon={<Lock size={16} />}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                revealable
              />
              <p className="register-card__password-hint">
                Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.
              </p>
              </div>

              <label
                className={`register-card__terms ${termsError ? "register-card__terms--error" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={() => {
                    setAcceptedTerms(!acceptedTerms);
                    setTermsError(false);
                  }}
                />
                <span>
                  Acepto los{" "}
                  <button
                    type="button"
                    className="register-card__terms-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegal("terms");
                    }}
                  >
                    Términos de uso
                  </button>{" "}
                  y la{" "}
                  <button
                    type="button"
                    className="register-card__terms-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLegal("privacy");
                    }}
                  >
                    Política de privacidad
                  </button>{" "}
                  de PetClue.
                </span>
              </label>

              {termsError && (
                <p className="register-card__terms-error" role="alert">
                  Debes aceptar los Términos de uso y la Política de privacidad para crear tu
                  cuenta.
                </p>
              )}
            </div>

            <PrimaryButton onClick={handleSubmit}>Crear cuenta</PrimaryButton>
          </div>

          <p className="login-card__signup">
            ¿Ya tienes cuenta?{" "}
            <button type="button" className="login-card__signup-link" onClick={onSwitchToLogin}>
              Inicia sesión
            </button>
          </p>
        </div>
      </div>

      {legal && <LegalModal initial={legal} onClose={() => setLegal(null)} />}
    </>
  );
}

export default RegisterCard;
