import { useEffect, useState } from "react";
import ChipGroup from "./ChipGroup";
import "./SpeciesPicker.css";

const COMMON_NAMES = ["perro", "gato", "ave"];
const normalize = (name: string) => name.trim().toLowerCase();

type Props = {
  species: { id: string; name: string }[];
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
};

/**
 * Especie: chips para las comunes (Perro/Gato/Ave) + "Otro", que abre un
 * desplegable con todo el catálogo (en español).
 */
export default function SpeciesPicker({ species, value, onChange, label = "Especie" }: Props) {
  const common = species.filter((s) => COMMON_NAMES.includes(normalize(s.name)));
  const isCommonSelected = common.some((s) => s.id === value);
  const [showOthers, setShowOthers] = useState(false);

  useEffect(() => {
    if (value && !isCommonSelected) setShowOthers(true);
    if (isCommonSelected) setShowOthers(false);
  }, [value, isCommonSelected]);

  const chipOptions = [
    ...common.map((s) => ({ value: s.id, label: s.name })),
    ...(species.some((s) => !COMMON_NAMES.includes(normalize(s.name)))
      ? [{ value: "__otro__", label: "Otro" }]
      : []),
  ];
  const chipValue = isCommonSelected ? value : value ? "__otro__" : null;

  return (
    <div className="species-picker">
      <ChipGroup
        options={chipOptions}
        value={chipValue}
        onChange={(v) => {
          if (v === "__otro__") {
            setShowOthers(true);
            if (isCommonSelected) onChange(null);
            return;
          }
          setShowOthers(false);
          onChange(v);
        }}
        label={label}
      />

      {showOthers && (
        <select
          className="pc-select species-picker__select"
          value={!isCommonSelected && value ? value : ""}
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value);
          }}
          aria-label="Elige la especie"
        >
          <option value="">Elige la especie…</option>
          {species.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
