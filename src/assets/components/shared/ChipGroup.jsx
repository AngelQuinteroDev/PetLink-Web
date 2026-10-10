import "./ChipGroup.css";

function ChipGroup({ options, value, onChange, variant = "tray" }) {
  return (
    <div className={`chip-group chip-group--${variant.split(" ").join(" chip-group--")}`}>
      {options.map((opt) => {
        const id = typeof opt === "string" ? opt : opt.id;
        const label = typeof opt === "string" ? opt : opt.label;
        const icon = typeof opt === "string" ? null : opt.icon;

        return (
          <button
            key={id}
            type="button"
            className={`chip-group__chip ${value === id ? "is-active" : ""}`}
            onClick={() => onChange?.(id)}
          >
            {icon && (
              <span className="chip-group__icon">
                {typeof icon === "string" ? (
                  <img src={icon} alt="" className="chip-group__icon-img" />
                ) : (
                  icon
                )}
              </span>
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default ChipGroup;