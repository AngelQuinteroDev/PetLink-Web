import CircleIconButton from "./CircleIconButton.jsx";
import "./AppHeader.css";

function AppHeader({
  title,
  leftIcon,
  leftLabel = "Volver",
  onLeft,
  rightIcon,
  rightLabel = "Notificaciones",
  onRight,
  glass = true,
}) {
  return (
    <div className="app-header__spacer">
      <header className={`app-header ${glass ? "app-header--glass" : ""}`}>
        {leftIcon ? (
          <CircleIconButton
            icon={leftIcon}
            iconAlt={leftLabel}
            ariaLabel={leftLabel}
            onClick={onLeft}
          />
        ) : (
          <span className="app-header__empty" />
        )}

        <h1 className="app-header__title">{title}</h1>

        {rightIcon ? (
          <CircleIconButton
            icon={rightIcon}
            iconAlt={rightLabel}
            ariaLabel={rightLabel}
            onClick={onRight}
          />
        ) : (
          <span className="app-header__empty" />
        )}
      </header>
    </div>
  );
}

export default AppHeader;