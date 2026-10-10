import "./InfoNotice.css";

function InfoNotice({ children }) {
  return (
    <div className="info-notice">
      <span className="info-notice__icon" aria-hidden="true">!</span>
      <p className="info-notice__text">{children}</p>
    </div>
  );
}

export default InfoNotice;