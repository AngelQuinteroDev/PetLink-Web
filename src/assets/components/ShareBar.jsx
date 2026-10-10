import "./ShareBar.css";

function ShareBar({ avatarUrl, text = "¿Qué quieres compartir con la comunidad?", onClick }) {
  return (
    <button type="button" className="share-bar" onClick={onClick}>
      <span className="share-bar__avatar">
        {avatarUrl && <img src={avatarUrl} alt="" />}
      </span>

      <span className="share-bar__text">{text}</span>

      <span className="share-bar__plus" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
    </button>
  );
}

export default ShareBar;