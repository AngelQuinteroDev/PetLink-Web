import { useState } from "react";
import AppHeader from "../shared/AppHeader.jsx";
import IconInputField from "../shared/IconInputField.jsx";
import InfoNotice from "../shared/InfoNotice.jsx";
import backIcon from "../../svg/Back.svg";
import mailIcon from "../../svg/Ajustes/correo electronico.svg";
import lockIcon from "../../svg/Ajustes/Privacidad.svg";
import "./ChangeEmailPage.css";

function ChangeEmailPage({ currentEmail = "", verified = true, onBack, onSubmit }) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = newEmail.trim() !== "" && password !== "";

  return (
    <>
      <AppHeader
        title="Correo electrónico"
        leftIcon={backIcon}
        onLeft={onBack}
      />

      <form
        className="change-email"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit?.({ newEmail, password });
        }}
      >
        {/* Correo actual */}
        <div className="change-email__current">
          <span className="change-email__current-label">CORREO ACTUAL</span>

          <div className="change-email__current-row">
            <span className="change-email__current-value">{currentEmail}</span>
            {verified && <span className="change-email__badge">Verificado</span>}
          </div>
        </div>

        <IconInputField
          label="Nuevo correo electrónico"
          icon={<img src={mailIcon} alt="" className="change-email__field-icon" />}
          type="email"
          placeholder="nombre@correo.com"
          autoComplete="email"
          value={newEmail}
          onChange={setNewEmail}
        />

        <IconInputField
          label="Confirma tu contraseña"
          icon={<img src={lockIcon} alt="" className="change-email__field-icon" />}
          type="password"
          placeholder="tu contraseña actual"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <InfoNotice>
          Te enviaremos un enlace de confirmación al nuevo correo. El cambio no
          se aplica hasta que lo confirmes.
        </InfoNotice>

        <button type="submit" className="change-email__submit" disabled={!canSubmit}>
          Enviar confirmación
        </button>
      </form>
    </>
  );
}

export default ChangeEmailPage;