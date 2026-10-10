import "./IconInputField.css";

function IconInputField({
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}) {
  return (
    <label className="icon-input-field">
      <span className="icon-input-field__label">{label}</span>

      <span className="icon-input-field__box">
        {icon && <span className="icon-input-field__icon">{icon}</span>}

        <input
          className="icon-input-field__input"
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </span>
    </label>
  );
}

export default IconInputField;