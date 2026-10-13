import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { PawPrint } from "lucide-react";
import StatusTag from "../StatusTag.jsx";
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../../contexts/AuthContext";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import {
  createReportMatch,
  expressAdoptionInterest,
  listAdoptionInterests,
  respondAdoptionInterest,
} from "../../lib/api";
import { timeAgo } from "../../lib/format";
import type { AdoptionInterest } from "../../lib/types";
import pawIcon from "../../assets/svg/ExpCard/huella_card.svg";
import starIcon from "../../assets/svg/ExpCard/stard_card.svg";
import clockIcon from "../../assets/svg/ExpCard/relog_card.svg";
import genderIcon from "../../assets/svg/ExpCard/genero_card.svg";
import sizeIcon from "../../assets/svg/ExpCard/tamaño_card.svg";
import colorIcon from "../../assets/svg/ExpCard/Color_card.svg";
import "./PetDetailModal.css";

export type PetDetailData = {
  kind: "report" | "adoption" | "pet";
  reportId?: string | null;
  petId?: string | null;
  ownerId?: string | null;
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

const INTEREST_STATUS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  withdrawn: "Retirado",
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
  const { user } = useAuth();
  useLockBodyScroll(Boolean(data));

  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSent, setContactSent] = useState(false);

  const [interests, setInterests] = useState<AdoptionInterest[]>([]);
  const [interestsBusy, setInterestsBusy] = useState(false);
  const [interestError, setInterestError] = useState<string | null>(null);

  const isMine = Boolean(data?.ownerId && user?.id === data.ownerId);
  const isAdoption = data?.kind === "adoption";
  const isReport = data?.kind === "report";

  useEffect(() => {
    if (!data) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, onClose]);

  // Reinicia el flujo de contacto al cambiar de tarjeta
  useEffect(() => {
    setContactOpen(false);
    setContactMessage("");
    setContactInfo("");
    setContactError(null);
    setContactSent(false);
  }, [data?.reportId, data?.petId]);

  // Dueño de una mascota en adopción: carga los interesados
  useEffect(() => {
    if (!data || data.kind !== "adoption" || !data.petId || !isMine) return;
    let active = true;
    void listAdoptionInterests(data.petId)
      .then((list) => {
        if (active) setInterests(list);
      })
      .catch(() => {
        if (active) setInterests([]);
      });
    return () => {
      active = false;
    };
  }, [data, isMine]);

  if (!data) return null;

  const items = [
    { icon: <img src={pawIcon} alt="" />, label: "Especie", value: data.species },
    { icon: <img src={starIcon} alt="" />, label: "Raza", value: data.breed },
    { icon: <img src={clockIcon} alt="" />, label: "Edad", value: data.age },
    {
      icon: <img src={genderIcon} alt="" />,
      label: "Sexo",
      value: data.sex ? SEX_LABELS[data.sex] ?? data.sex : null,
    },
    {
      icon: <img src={sizeIcon} alt="" />,
      label: "Tamaño",
      value: data.size ? SIZE_LABELS[data.size] ?? data.size : null,
    },
    { icon: <img src={colorIcon} alt="" />, label: "Color", value: data.color },
  ].filter((item) => item.value != null && String(item.value).trim() !== "");

  async function sendContact() {
    if (!data || contactBusy) return;
    setContactBusy(true);
    setContactError(null);
    try {
      if (isAdoption && data.petId) {
        await expressAdoptionInterest(data.petId, contactMessage.trim());
      } else if (isReport && data.reportId) {
        await createReportMatch({
          reportId: data.reportId,
          message: contactMessage.trim() || null,
          contact: contactInfo.trim() || null,
        });
      }
      setContactSent(true);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "";
      if (message.includes("duplicate")) {
        setContactError("Ya avisaste al dueño sobre esta mascota.");
      } else if (message.includes("muchas coincidencias")) {
        setContactError("Este reporte ya tiene muchas coincidencias recientes.");
      } else if (message.includes("not listed for adoption")) {
        setContactError("Esta mascota ya no está en adopción.");
      } else {
        setContactError("No pudimos enviar tu mensaje. Intenta de nuevo.");
      }
    } finally {
      setContactBusy(false);
    }
  }

  async function respond(interestId: string, status: "approved" | "rejected") {
    if (!data?.petId || interestsBusy) return;
    setInterestsBusy(true);
    setInterestError(null);
    try {
      await respondAdoptionInterest(interestId, status);
      setInterests(await listAdoptionInterests(data.petId));
    } catch {
      setInterestError("No pudimos guardar la respuesta. Intenta de nuevo.");
    } finally {
      setInterestsBusy(false);
    }
  }

  const contactTitle = isAdoption
    ? "Contactar al dueño"
    : data.status === "Encontrado"
      ? "Contactar a quien la encontró"
      : `¿Encontraste a ${data.name}?`;

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

            {/* Mascota en adopción y es mía: ver y responder a los interesados */}
            {isAdoption && isMine && (
              <div className="adoption-interests">
                <h3 className="pet-detail__section">Interesados en adoptar</h3>
                {interests.length === 0 && (
                  <p className="pet-detail__empty">Todavía nadie ha pedido adoptarla.</p>
                )}
                {interests.map((i) => (
                  <div key={i.id} className="adoption-interests__item">
                    <div className="adoption-interests__head">
                      <strong>{i.interested?.name ?? "Usuario"}</strong>
                      <span className={`adoption-interests__status adoption-interests__status--${i.status}`}>
                        {INTEREST_STATUS[i.status] ?? i.status}
                      </span>
                    </div>
                    {i.message && <p className="adoption-interests__message">{i.message}</p>}
                    <span className="adoption-interests__time">{timeAgo(i.created_at)}</span>
                    {i.status === "pending" && (
                      <div className="adoption-interests__actions">
                        <button
                          type="button"
                          className="adoption-interests__reject"
                          disabled={interestsBusy}
                          onClick={() => void respond(i.id, "rejected")}
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          className="adoption-interests__accept"
                          disabled={interestsBusy}
                          onClick={() => void respond(i.id, "approved")}
                        >
                          Aprobar adopción
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {interestError && (
                  <p className="pc-error-text" role="alert">
                    {interestError}
                  </p>
                )}
              </div>
            )}

            {/* Contacto privado: alertas (avisar al dueño) y adopción (interés) */}
            {!isMine && (isReport || isAdoption) && (
              <button
                type="button"
                className="pet-detail__contact"
                onClick={() => setContactOpen(true)}
              >
                {isAdoption
                  ? "Contactar al dueño"
                  : data.status === "Encontrado"
                    ? "Contactar a quien la encontró"
                    : "Contactar al dueño"}
              </button>
            )}
          </div>
        </div>
      </div>

      {contactOpen && (
        <ConfirmModal
          title={contactTitle}
          confirmLabel={
            contactSent ? "Entendido" : contactBusy ? "Enviando…" : isAdoption ? "Enviar mensaje" : "Avisar al dueño"
          }
          onClose={() => setContactOpen(false)}
          onConfirm={() => {
            if (contactSent) {
              setContactOpen(false);
              return;
            }
            void sendContact();
          }}
        >
          {contactSent ? (
            <>
              <p>
                {isAdoption
                  ? "Tu mensaje llegó al dueño. Te avisará cuando responda tu solicitud."
                  : "Avisamos al dueño de la alerta. La alerta sigue activa hasta que el dueño confirme que la recuperó."}
              </p>
              {isReport && contactInfo.trim() && (
                <p>Si dejaste un contacto, el dueño podrá usarlo para comunicarse contigo.</p>
              )}
            </>
          ) : (
            <>
              <div className="pc-field">
                <label className="pc-field-label" htmlFor="detail-contact-msg">
                  {isAdoption
                    ? "Cuéntale por qué te interesa adoptarlo (opcional)"
                    : "¿Dónde y cómo la encontraste? (opcional)"}
                </label>
                <textarea
                  id="detail-contact-msg"
                  className="pc-textarea"
                  placeholder={
                    isAdoption
                      ? "Ej: Tengo experiencia con gatos y un hogar tranquilo…"
                      : "Ej: La encontré en el parque, lleva collar rojo…"
                  }
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>
              {isReport && (
                <div className="pc-field">
                  <label className="pc-field-label" htmlFor="detail-contact-info">
                    Tu contacto (opcional, solo lo ve el dueño)
                  </label>
                  <input
                    id="detail-contact-info"
                    className="pc-input"
                    placeholder="Teléfono o correo"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                </div>
              )}
              {contactError && (
                <p className="pc-error-text" role="alert">
                  {contactError}
                </p>
              )}
            </>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}
