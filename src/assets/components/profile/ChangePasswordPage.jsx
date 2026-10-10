import { useState } from "react";
import AppHeader from "../shared/AppHeader.jsx";
import IconInputField from "../shared/IconInputField.jsx";
import InfoNotice from "../shared/InfoNotice.jsx";
import backIcon from "../../svg/Back.svg";
import lockIcon from "../../svg/Ajustes/Privacidad.svg";
import "./ChangePasswordPage.css";

const MIN_LENGTH = 8;

function ChangePasswordPage({ onBack, onSubmit }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const tooShort = next !== "" && next.length < MIN_LENGTH;
  const mismatch = confirm !== "" && next !== confirm;
  const canSubmit =
    current !== "" && next.length >= MIN_LENGTH && next === confirm;

  const icon = <img src={lockIcon} alt="" className="change-password__icon" />;

  return (
    <>
      <AppHeader title="Cambiar contraseña" leftIcon={backIcon} onLeft={onBack} />

      <form
        className="change-password"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit?.({ current, next });
        }}
      >
        <IconInputField
          label="Contraseña actual"
          icon={icon}
          type="password"
          placeholder="Ingresa tu contraseña actual"
          autoComplete="current-password"
          value={current}
          onChange={setCurrent}
        />

        <div className="change-password__group">
          <IconInputField
            label="Nueva contraseña"
            icon={icon}
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            autoComplete="new-password"
            value={next}
            onChange={setNext}
          />
          {tooShort && (
            <p className="change-password__error">
              Debe tener al menos {MIN_LENGTH} caracteres.
            </p>
          )}
        </div>

        <div className="change-password__group">
          <IconInputField
            label="Confirma la nueva contraseña"
            icon={icon}
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
          />
          {mismatch && (
            <p className="change-password__error">Las contraseñas no coinciden.</p>
          )}
        </div>

        <InfoNotice>
          Después de cambiar tu contraseña, cerraremos sesión en tus otros
          dispositivos por seguridad.
        </InfoNotice>

        <button type="submit" className="change-password__submit" disabled={!canSubmit}>
          Guardar cambios
        </button>
      </form>
    </>
  );
}

export default ChangePasswordPage;