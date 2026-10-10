import { useEffect } from "react";
import pawIcon from "../svg/Huella.svg";
import "./SuccessToast.css";

function SuccessToast({ open, message, onDone, duration = 2200 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onDone]);

  if (!open) return null;

  return (
    <div className="success-toast" role="status">
      <span className="success-toast__paw" style={{ WebkitMaskImage: `url("${pawIcon}")`, maskImage: `url("${pawIcon}")` }} />
      {message}
    </div>
  );
}

export default SuccessToast;