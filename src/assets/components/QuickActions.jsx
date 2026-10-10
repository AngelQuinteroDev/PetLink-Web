import heartIcon from "../svg/Report/corazon.svg";
import "./QuickActions.css";

// Pinta un SVG con un solo color usando máscara
function MaskIcon({ src, className }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
      }}
    />
  );
}

function QuickActions({ onLost, onFound }) {
  return (
    <div className="quick-actions">
      <button type="button" className="quick-actions__btn quick-actions__btn--lost" onClick={onLost}>
        <span className="quick-actions__paw" aria-hidden="true" />
        <span>¡PERDÍ MI MASCOTA!</span>
      </button>

      <button type="button" className="quick-actions__btn quick-actions__btn--found" onClick={onFound}>
        <MaskIcon src={heartIcon} className="quick-actions__heart" />
        <span>ENCONTRÉ UN ANIMAL</span>
      </button>
    </div>
  );
}

export default QuickActions;