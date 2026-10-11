import { MapPin } from "lucide-react";
import { CITIES } from "../../lib/prefs";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import "./CityPickerModal.css";

type Props = {
  value: string;
  onSelect: (city: string) => void;
  onClose: () => void;
};

export default function CityPickerModal({ value, onSelect, onClose }: Props) {
  useLockBodyScroll(true);

  return (
    <div className="city-modal__overlay" onClick={onClose} role="presentation">
      <div
        className="city-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Elegir ciudad"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="city-modal__title">
          <MapPin size={17} /> Ciudad por defecto
        </h2>
        <p className="city-modal__hint">
          Se usará para mostrar tu ubicación aproximada en tu perfil y en tus publicaciones.
        </p>
        <div className="city-modal__grid">
          {CITIES.map((city) => (
            <button
              key={city}
              type="button"
              className={`city-modal__chip ${city === value ? "is-active" : ""}`}
              onClick={() => {
                onSelect(city);
                onClose();
              }}
            >
              {city}
            </button>
          ))}
        </div>
        <div className="city-modal__actions">
          <button type="button" className="pc-outline-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
