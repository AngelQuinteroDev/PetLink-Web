import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import NotificationBell from "./NotificationBell";
import "./GlassHeader.css";

type Props = {
  title: string;
};

/**
 * Top bar estilo app móvil (Fix): píldora glass fija con volver + título +
 * campana. En desktop se oculta y se muestra el título simple de la página.
 */
export default function GlassHeader({ title }: Props) {
  const navigate = useNavigate();

  return (
    <>
      <div className="glass-header__spacer" aria-hidden="true" />

      <header className="glass-header">
        <button
          type="button"
          className="glass-header__circle"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ChevronLeft size={18} />
        </button>

        <h1 className="glass-header__title">{title}</h1>

        <NotificationBell />
      </header>

      <div className="pc-page-header glass-header__desktop">
        <h1 className="pc-title">{title}</h1>
      </div>
    </>
  );
}
