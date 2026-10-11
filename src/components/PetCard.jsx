import { Pencil } from "lucide-react";
import StatusTag from "./StatusTag.jsx";
import "./PetCard.css";

/**
 * @param {{
 *   status?: string;
 *   name?: string;
 *   location?: string;
 *   photoUrl?: string;
 *   onClick?: () => void;
 *   onEdit?: (() => void) | null;
 * }} props
 */
function PetCard({
  status = "Perdido",
  name = "Nombre",
  location = "Ubicación · hoy",
  photoUrl = "",
  onClick = () => {},
  onEdit = null,
}) {
  const interactive = Boolean(onClick);

  return (
    <article
      className="pet-card"
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="pet-card__photo">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
          />
        ) : (
          <span>Foto</span>
        )}
      </div>

      {onEdit && (
        <button
          type="button"
          className="pet-card__edit"
          aria-label={`Editar ${name}`}
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
        >
          <Pencil size={14} />
        </button>
      )}

      <div className="pet-card__info">
        <StatusTag status={status} />

        <h2 className="pet-card__name">{name}</h2>

        <p className="pet-card__location">{location}</p>
      </div>
    </article>
  );
}

export default PetCard;
