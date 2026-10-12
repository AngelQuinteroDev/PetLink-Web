import { useEffect } from "react";
import { X } from "lucide-react";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import "./ImageViewer.css";

type Props = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export default function ImageViewer({ src, alt = "", onClose }: Props) {
  useLockBodyScroll(true);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="image-viewer__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vista de imagen"
    >
      <button
        type="button"
        className="image-viewer__close"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X size={20} />
      </button>
      <img
        className="image-viewer__img"
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
