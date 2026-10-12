import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import "./MapPopupCard.css";

type Props = {
  title: string;
  meta?: string;
  badge?: string;
  badgeColor?: string;
  photoUrl?: string | null;
  icon?: ReactNode;
  phone?: string | null;
  onClick?: () => void;
};

export default function MapPopupCard({
  title,
  meta,
  badge,
  badgeColor,
  photoUrl,
  icon,
  phone,
  onClick,
}: Props) {
  const thumb = photoUrl ? (
    <img
      className="map-popup-card__thumb"
      src={photoUrl}
      alt=""
      loading="lazy"
      decoding="async"
    />
  ) : (
    <span className="map-popup-card__thumb map-popup-card__thumb--empty" aria-hidden="true">
      {icon}
    </span>
  );

  const info = (
    <span className="map-popup-card__info">
      <span className="map-popup-card__title">{title}</span>
      {meta && <span className="map-popup-card__meta">{meta}</span>}
      {onClick && <span className="map-popup-card__hint">Ver detalles ›</span>}
    </span>
  );

  const trailing = badge ? (
    <span
      className="map-popup-card__badge"
      style={badgeColor ? { background: badgeColor } : undefined}
    >
      {badge}
    </span>
  ) : null;

  if (onClick) {
    return (
      <button type="button" className="map-popup-card" onClick={onClick}>
        {thumb}
        {info}
        {trailing}
      </button>
    );
  }

  return (
    <div className="map-popup-card map-popup-card--static">
      {thumb}
      {info}
      {trailing}
      {phone && (
        <a
          className="map-popup-card__call"
          href={`tel:${phone}`}
          aria-label={`Llamar a ${title}`}
        >
          <Phone size={14} />
        </a>
      )}
    </div>
  );
}
