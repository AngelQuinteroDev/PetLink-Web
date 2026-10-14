import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";
import "./GlassHeader.css";

type Props = {
  title: string;
  /** Lupa opcional en el header (p. ej. Comunidad): alterna la barra de búsqueda. */
  searchOpen?: boolean;
  onToggleSearch?: () => void;
};

/**
 * Top bar estilo app móvil (Fix): píldora glass fija con volver + título +
 * (lupa opcional) + campana. En desktop se oculta y se muestra el título
 * simple de la página.
 */
export default function GlassHeader({ title, searchOpen = false, onToggleSearch }: Props) {
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

        {onToggleSearch && (
          <button
            type="button"
            className={`glass-header__circle ${searchOpen ? "glass-header__circle--active" : ""}`}
            onClick={onToggleSearch}
            aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar publicaciones"}
          >
            <Search size={18} />
          </button>
        )}

        <NotificationBell />
      </header>

      <div className="pc-page-header glass-header__desktop">
        {onToggleSearch && <span className="glass-header__desktop-spacer" aria-hidden="true" />}
        <h1 className="pc-title">{title}</h1>
        {onToggleSearch && (
          <button
            type="button"
            className="pc-icon-btn"
            onClick={onToggleSearch}
            aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar publicaciones"}
          >
            <Search size={18} />
          </button>
        )}
      </div>
    </>
  );
}
