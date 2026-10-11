import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export type SettingsRowProps = {
  icon: ReactNode;
  label: string;
  sublabel?: string;
  value?: string;
  danger?: boolean;
  right?: ReactNode;
  onClick?: () => void;
};

export default function SettingsRow({
  icon,
  label,
  sublabel,
  value,
  danger,
  right,
  onClick,
}: SettingsRowProps) {
  const content = (
    <>
      <span className="settings-row__left">
        <span className={`settings-row__icon ${danger ? "settings-row__icon--danger" : ""}`}>
          {icon}
        </span>
        <span className="settings-row__text">
          <span className="settings-row__label">{label}</span>
          {sublabel && <span className="settings-row__sublabel">{sublabel}</span>}
        </span>
      </span>
      <span className="settings-row__right">
        {value && <span className="settings-row__value">{value}</span>}
        {right ?? (onClick ? <ChevronRight size={16} className="settings-row__chevron" /> : null)}
      </span>
    </>
  );

  if (!onClick) return <div className="settings-row">{content}</div>;

  return (
    <button
      type="button"
      className={`settings-row ${danger ? "settings-row--danger" : ""}`}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
