import AppHeader from "../shared/AppHeader.jsx";
import backIcon from "../../svg/Back.svg";
import "./RequestCard.css";
import "./ReviewRequestPage.css";

const TYPE_LABEL = { vet: "VETERINARIA", doctor: "MÉDICO VET.", refuge: "REFUGIO" };
const STATUS_LABEL = { pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado" };

const s = { stroke: "var(--titulos, #7519FF)", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" {...s} /><path d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21" {...s} /></svg>
);
const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 21C12 21 19 14.5 19 8.5C19 4.9 15.9 2 12 2C8.1 2 5 4.9 5 8.5C5 14.5 12 21 12 21Z" fill="var(--titulos, #7519FF)" /><circle cx="12" cy="8.5" r="2.5" fill="#fff" /></svg>
);
const Chevron = () => (
  <svg width="8" height="11" viewBox="0 0 8 11" fill="none"><path d="M1 1L6 5.03L1 10" stroke="#66557E" strokeWidth="2" strokeLinecap="round" /></svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 12.5L9.5 18L20 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
);
const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M5 5L19 19M19 5L5 19" stroke="#a0403c" strokeWidth="2.2" strokeLinecap="round" /></svg>
);

function ReviewRequestPage({ request, onBack, onAccept, onReject, onOpenDocument }) {
  if (!request) return null;

  const { type, status, name, location, email, address, description, documents = [], photoUrl } = request;
  const decided = status !== "pending";

  return (
    <>
      <AppHeader title="Revisar solicitud" leftIcon={backIcon} onLeft={onBack} />

      <div className="review">
        {/* Resumen */}
        <article className="review__summary">
          <div className="request-card__photo review__photo">{photoUrl && <img src={photoUrl} alt="" />}</div>

          <div className="request-card__info">
            <div className="request-card__row">
              <span className={`request-card__type request-card__type--${type}`}>{TYPE_LABEL[type]}</span>
              <span className={`request-card__status request-card__status--${status}`}>{STATUS_LABEL[status]}</span>
            </div>
            <h2 className="review__name">{name}</h2>
            <p className="request-card__location">{location}</p>
          </div>
        </article>

        {/* Contacto */}
        <h3 className="review__title">Datos de contacto</h3>
        <div className="review__card">
          <div className="review__contact">
            <span className="review__circle"><UserIcon /></span>
            <span className="review__contact-text">
              <span className="review__small">Correo</span>
              <span className="review__value">{email || "—"}</span>
            </span>
          </div>
          <div className="review__contact">
            <span className="review__circle"><PinIcon /></span>
            <span className="review__contact-text">
              <span className="review__small">Dirección</span>
              <span className="review__value">{address || "—"}</span>
            </span>
          </div>
        </div>

        {/* Descripción */}
        <h3 className="review__title">Descripción</h3>
        <div className="review__card review__description">{description || "Sin descripción."}</div>

        {/* Documentos */}
        <h3 className="review__title">Documentos adjuntos</h3>
        <div className="review__card">
          {documents.length === 0 && <p className="review__empty">Sin documentos.</p>}
          {documents.map((d) => (
            <button key={d.id} type="button" className="review__doc" onClick={() => onOpenDocument?.(d)}>
              <span className="review__pdf">PDF</span>
              <span className="review__doc-name">{d.name}</span>
              <Chevron />
            </button>
          ))}
        </div>

        {/* Decisión */}
        <div className="review__decision">
          <p className="review__decision-text">
            {decided ? "Esta solicitud ya fue revisada" : "Se le notificará al solicitante tu decisión"}
          </p>

          <div className="review__buttons">
            <button type="button" className="review__reject" disabled={decided} onClick={() => onReject?.(request)}>
              <CrossIcon /> Rechazar
            </button>
            <button type="button" className="review__accept" disabled={decided} onClick={() => onAccept?.(request)}>
              <CheckIcon /> Aceptar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReviewRequestPage;