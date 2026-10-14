import { Search } from "lucide-react";
import "./SearchBar.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  label?: string;
};

/** Barra de búsqueda tipo píldora (homologada de la app). */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Busca…",
  autoFocus = false,
  label = "Buscar",
}: Props) {
  return (
    <label className="search-bar">
      <Search size={17} className="search-bar__icon" aria-hidden="true" />
      <input
        className="search-bar__input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={label}
      />
    </label>
  );
}
