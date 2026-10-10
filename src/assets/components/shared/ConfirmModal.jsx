import PawBackground from "./PawBackground.jsx";
import useLockBodyScroll from "../../../hooks/useLockBodyScroll.js";
import catDog from "../../Recursos/CatDog.png";
import "./ConfirmModal.css";

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6L18 18" stroke="var(--titulos, #7519FF)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  onClose,
}) {
  useLockBodyScroll(open);

  if (!open) return null;

  return (
    <div className="confirm-modal__overlay" onClick={onClose}>
      <div
        className="confirm-modal__card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <PawBackground contained />

        <button type="button" className="confirm-modal__close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </button>

        <img src={catDog} alt="" className="confirm-modal__image" />

        <h2 className="confirm-modal__title">{title}</h2>
        <p className="confirm-modal__text">{description}</p>

        <button type="button" className="confirm-modal__confirm" onClick={onConfirm}>
          {confirmLabel}
        </button>

        <button type="button" className="confirm-modal__cancel" onClick={onClose}>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}

export default ConfirmModal;