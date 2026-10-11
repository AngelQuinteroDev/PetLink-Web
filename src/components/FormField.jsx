import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./FormField.css";

function FormField({
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  revealable = false,
}) {
  const [revealed, setRevealed] = useState(false);
  const inputType = revealable && revealed ? "text" : type;

  return (
    <div className="form-field">
      <div className="form-field__label-row">
        <span className="form-field__label">{label}</span>
      </div>
      <div className="form-field__input">
        <span className="form-field__icon">{icon}</span>
        <input
          className="form-field__input-el"
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {revealable && (
          <button
            type="button"
            className="form-field__eye"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={revealed}
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default FormField;
