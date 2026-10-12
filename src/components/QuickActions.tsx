import huellaIcon from "../assets/svg/Huella.svg";
import corazonIcon from "../assets/svg/corazon.svg";
import "./QuickActions.css";

type Props = {
  onLost: () => void;
  onFound: () => void;
};

function MaskIcon({ src, className }: { src: string; className: string }) {
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

export default function QuickActions({ onLost, onFound }: Props) {
  return (
    <div className="quick-actions">
      <button
        type="button"
        className="quick-actions__btn quick-actions__btn--lost"
        onClick={onLost}
      >
        <MaskIcon src={huellaIcon} className="quick-actions__paw" />
        <span>¡PERDÍ MI MASCOTA!</span>
      </button>

      <button
        type="button"
        className="quick-actions__btn quick-actions__btn--found"
        onClick={onFound}
      >
        <MaskIcon src={corazonIcon} className="quick-actions__heart" />
        <span>ENCONTRÉ UN ANIMAL</span>
      </button>
    </div>
  );
}
