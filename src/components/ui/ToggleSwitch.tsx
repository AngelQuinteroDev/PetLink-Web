import "./ToggleSwitch.css";

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

export default function ToggleSwitch({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle-switch ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-switch__thumb" />
    </button>
  );
}
