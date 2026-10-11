import { useEffect, useState } from "react";
import { MapPin, UserRound } from "lucide-react";
import { CITIES } from "../../lib/prefs";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import "./CityPickerModal.css";
import "./EditProfileModal.css";

type Props = {
  initialName: string;
  initialCity: string;
  onSave: (name: string, city: string) => Promise<void>;
  onClose: () => void;
};

export default function EditProfileModal({ initialName, initialCity, onSave, onClose }: Props) {
  const [name, setName] = useState(initialName);
  const [city, setCity] = useState(initialCity);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useLockBodyScroll(true);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save() {
    if (name.trim().length < 2) {
      setError("Escribe tu nombre.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave(name.trim(), city);
      onClose();
    } catch {
      setError("No pudimos guardar tus datos. Intenta de nuevo.");
      setBusy(false);
    }
  }

  return (
    <div className="edit-profile__overlay" onClick={onClose} role="presentation">
      <div
        className="edit-profile"
        role="dialog"
        aria-modal="true"
        aria-label="Editar información personal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="edit-profile__title">
          <UserRound size={18} /> Editar información personal
        </h2>

        <div className="pc-field">
          <label className="pc-field-label" htmlFor="profile-name">
            Nombre
          </label>
          <input
            id="profile-name"
            className="pc-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="pc-field">
          <span className="pc-field-label">
            <MapPin size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Ciudad
          </span>
          <div className="edit-profile__cities">
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`city-modal__chip ${c === city ? "is-active" : ""}`}
                onClick={() => setCity(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="pc-error-text" role="alert">
            {error}
          </p>
        )}

        <div className="edit-profile__actions">
          <button type="button" className="pc-outline-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="confirm-modal__confirm"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
