import "./FaqItem.css";

function FaqItem({ question, answer, open, onToggle }) {
  return (
    <div className={`faq ${open ? "is-open" : ""}`}>
      <button type="button" className="faq__question" aria-expanded={open} onClick={onToggle}>
        <span>{question}</span>
        <svg className="faq__chevron" width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
          <path d="M1 1L9 9L17 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && <p className="faq__answer">{answer}</p>}
    </div>
  );
}

export default FaqItem;