import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";
import "./NotificationBell.css";

export default function NotificationBell() {
  const navigate = useNavigate();
  const unread = useUnreadNotifications();

  return (
    <button
      type="button"
      className="notification-bell"
      onClick={() => navigate("/notificaciones")}
      aria-label={`Notificaciones${unread ? ` (${unread} sin leer)` : ""}`}
    >
      <Bell size={17} />
      {unread > 0 && <span className="notification-bell__badge">{unread}</span>}
    </button>
  );
}
