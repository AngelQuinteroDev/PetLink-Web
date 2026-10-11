import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LegalDocContent from "../components/ui/LegalDocContent";
import { LEGAL_DOCS } from "../lib/legalDocs";
import "../styles/legal.css";

type Doc = "terms" | "privacy";

export default function LegalPage({ doc }: { doc: Doc }) {
  const navigate = useNavigate();
  const current = LEGAL_DOCS[doc];

  useEffect(() => {
    document.title = `${current.title} · PetClue`;
    window.scrollTo(0, 0);
  }, [current]);

  return (
    <div className="legal-page">
      <header className="legal-page__header">
        <button
          type="button"
          className="legal-page__back"
          onClick={() => navigate("/")}
          aria-label="Volver a PetClue"
        >
          <ArrowLeft size={16} /> PetClue
        </button>

        <nav className="legal-page__tabs" aria-label="Documentos legales">
          <Link
            to="/terminos"
            className={`legal-page__tab ${doc === "terms" ? "active" : ""}`}
          >
            Términos
          </Link>
          <Link
            to="/privacidad"
            className={`legal-page__tab ${doc === "privacy" ? "active" : ""}`}
          >
            Privacidad
          </Link>
        </nav>
      </header>

      <main className="legal-page__card legal-doc">
        <LegalDocContent doc={current} />
      </main>

      <footer className="legal-page__footer">
        <span>PetClue</span>
        <Link to="/login">Iniciar sesión</Link>
      </footer>
    </div>
  );
}
