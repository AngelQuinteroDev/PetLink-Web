import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Clock, Dna, Palette, PawPrint, Ruler, VenusAndMars } from "lucide-react";
import StatusTag from "../StatusTag.jsx";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import "./PetDetailModal.css";

export type PetDetailData = {
  name: string;
  photoUrl?: string | null;
  location?: string | null;
  status: string;
  species?: string | null;
  breed?: string | null;
  age?: string | null;
  sex?: string | null;
  size?: string | null;
  color?: string | null;
  marks?: string | null;
  ownerName?: string | null;
  postId?: string | null;
};

const SEX_LABELS: Record<string, string> = {
  male: "Macho",
  female: "Hembra",
  unknown: "No definido",
};

const SIZE_LABELS: Record<string, string> = {
  small: "Pequeño",
  medium: "Mediano",
  large: "Grande",
};

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) {
  return (
    <div className="pet-detail__item">
      <span className="pet-detail__item-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="pet-detail__item-text">
        <span className="pet-detail__item-label">{label}</span>
        <span className="pet-detail__item-value">{value || "—"}</span>
      </span>
    </div>
  );
}

type Props = {
  data: PetDetailData | null;
  onClose: () => void;
};

export default function PetDetailModal({ data, onClose }: Props) {
  const navigate = useNavigate();
  useLockBodyScroll(Boolean(data));

  useEffect(() => {
    if (!data) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, onClose]);

  if (!data) return null;

  const items = [
    { icon: <PawPrint size={16} />, label: "Especie", value: data.species },
    { icon: <Dna size={16} />, label: "Raza", value: data.breed },
    { icon: <Clock size={16} />, label: "Edad", value: data.age },
    {
      icon: <VenusAndMars size={16} />,
      label: "Sexo",
      value: data.sex ? SEX_LABELS[data.sex] ?? data.sex : null,
    },
    {
      icon: <Ruler size={16} />,
      label: "Tamaño",
      value: data.size ? SIZE_LABELS[data.size] ?? data.size : null,
    },
    { icon: <Palette size={16} />, label: "Color", value: data.color },
  ].filter((item) => item.value != null && String(item.value).trim() !== "");

  return (
    <div className="pet-detail__overlay" onClick={onClose} role="presentation">
      <div
        className="pet-detail__sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${data.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="pet-detail__handle" aria-hidden="true" />

        <div className="pet-detail__scroll">
          <div className="pet-detail__photo">
            {data.photoUrl ? (
              <img src={data.photoUrl} alt={data.name} />
            ) : (
              <span className="pet-detail__photo-empty" aria-hidden="true">
                <PawPrint size={36} strokeWidth={1.4} />
              </span>
            )}
          </div>

          <div className="pet-detail__body">
            <div className="pet-detail__head">
              <div>
                <h2 className="pet-detail__name">{data.name}</h2>
                {data.location && <p className="pet-detail__location">{data.location}</p>}
              </div>
              <StatusTag status={data.status} />
            </div>

            <h3 className="pet-detail__section">Información</h3>
            {items.length > 0 ? (
              <div className="pet-detail__grid">
                {items.map((item) => (
                  <InfoItem key={item.label} icon={item.icon} label={item.label} value={item.value} />
                ))}
              </div>
            ) : (
              <p className="pet-detail__empty">
                Este reporte no incluye más detalles de la mascota. Revisa las señas
                particulares o contacta a quien lo publicó.
              </p>
            )}

            <h3 className="pet-detail__section">Señas particulares</h3>
            <p className="pet-detail__marks">{data.marks || "Sin señas registradas."}</p>

            {data.ownerName && (
              <p className="pet-detail__owner">
                Publicado por: <strong>{data.ownerName}</strong>
              </p>
            )}

            {data.postId && (
              <button
                type="button"
                className="pet-detail__contact"
                onClick={() => {
                  onClose();
                  navigate(`/comunidad?post=${data.postId}`);
                }}
              >
                Ver publicación y comentar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
