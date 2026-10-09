import "./TextInputField.css";

function TextInputField({ label, optional, value, onChange, type = "text", placeholder }) {
  return (
    <label className="text-input-field">
      <span className="text-input-field__label">
        {label}
        {optional && <span className="text-input-field__optional"> (opcional)</span>}
      </span>

      <input
        className="text-input-field__input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}

export default TextInputField;