import "./PillButton.css";

function PillButton({
  icon,
  label = "Ver todo",
  variant = "light", // "light" | "dark"
  onClick,
}) {
  return (
    <button
      type="button"
      className={`pill-button pill-button--${variant}`}
      onClick={onClick}
    >
      {icon && (
        <span
          className="pill-button__icon"
          aria-hidden="true"
          style={{
            WebkitMaskImage: `url("${icon}")`,
            maskImage: `url("${icon}")`,
          }}
        />
      )}
      <span className="pill-button__label">{label}</span>
    </button>
  );
}

export default PillButton;