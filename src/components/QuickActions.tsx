import { Heart, PawPrint } from "lucide-react";
import "./QuickActions.css";

type Props = {
  onLost: () => void;
  onFound: () => void;
};

export default function QuickActions({ onLost, onFound }: Props) {
  return (
    <div className="quick-actions">
      <button
        type="button"
        className="quick-actions__btn quick-actions__btn--lost"
        onClick={onLost}
      >
        <PawPrint size={34} strokeWidth={1.8} aria-hidden="true" />
        <span>¡PERDÍ MI MASCOTA!</span>
      </button>

      <button
        type="button"
        className="quick-actions__btn quick-actions__btn--found"
        onClick={onFound}
      >
        <Heart size={32} strokeWidth={1.8} aria-hidden="true" />
        <span>ENCONTRÉ UN ANIMAL</span>
      </button>
    </div>
  );
}
