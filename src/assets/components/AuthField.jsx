import "./AuthPages.css";

function AuthField({ label, icon, type = "text", value, onChange, placeholder, autoComplete }) {
  return (
    <label className="auth-field">
      <span className="auth-field__label">{label}</span>

      <span className="auth-field__box">
        <span className="auth-field__icon">{icon}</span>
        <input
          className="auth-field__input"
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

export default AuthField;