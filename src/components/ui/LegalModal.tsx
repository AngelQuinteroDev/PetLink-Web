import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LEGAL_DOCS } from "../../lib/legalDocs";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import "./LegalModal.css";

type Doc = "terms" | "privacy";

type Props = {
  initial?: Doc;
  onClose: () => void;
};

export default function LegalModal({ initial = "terms", onClose }: Props) {
  const [doc, setDoc] = useState<Doc>(initial);
  useLockBodyScroll(true);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const current = LEGAL_DOCS[doc];

  return (
    <div className="legal-modal__overlay" onClick={onClose} role="presentation">
      <div
        className="legal-modal"
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="legal-modal__header">
          <div className="legal-modal__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={doc === "terms"}
              className={`legal-modal__tab ${doc === "terms" ? "active" : ""}`}
              onClick={() => setDoc("terms")}
            >
              Términos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={doc === "privacy"}
              className={`legal-modal__tab ${doc === "privacy" ? "active" : ""}`}
              onClick={() => setDoc("privacy")}
            >
              Privacidad
            </button>
          </div>
          <button
            type="button"
            className="legal-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="legal-modal__scroll">
          <h2 className="legal-modal__title">{current.title}</h2>
          <p className="legal-modal__updated">Última actualización: {current.updated}</p>

          {current.blocks.map((block, i) => {
            if ("h" in block) return <h3 key={i}>{block.h}</h3>;
            if ("ul" in block)
              return (
                <ul key={i}>
                  {block.ul.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            return <p key={i}>{block.p}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
