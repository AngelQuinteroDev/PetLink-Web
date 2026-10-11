import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import "./ConfirmModal.css";

type Props = {
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onClose,
}: Props) {
  useLockBodyScroll(true);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="confirm-modal__overlay" onClick={onClose} role="presentation">
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="confirm-modal__title">{title}</h2>
        <div className="confirm-modal__body">{children}</div>
        <div className="confirm-modal__actions">
          <button type="button" className="pc-outline-btn" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-modal__confirm ${danger ? "confirm-modal__confirm--danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
