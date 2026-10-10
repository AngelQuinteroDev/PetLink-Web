import logoMark from "../svg/Logo.svg";
import logoText from "../svg/PetClue_Logo.svg";
import "./AuthPages.css";

function AuthLogo() {
  return (
    <div className="auth-logo-stack">
      <img src={logoMark} alt="" className="auth-logo-stack__mark" />
      <img src={logoText} alt="PetClue" className="auth-logo-stack__text" />
    </div>
  );
}

export default AuthLogo;