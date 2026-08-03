import { FaTimes } from "react-icons/fa";
import RoundIconButton from "../buttons/RoundIconButton";
import "./InfoModal.css";

export default function InfoModal({
  open,
  text,
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="info-modal-overlay"
      onClick={onClose}
    >
      <section
        className="info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <RoundIconButton
          type="small"
          className="info-modal-close"
          arialabel="Close information"
          onClick={onClose}
        >
          <FaTimes aria-hidden="true" />
        </RoundIconButton>
        <h2 id="info-modal-title">
          Information
        </h2>
        <p className="info-modal-text">
          {text}
        </p>
      </section>
    </div>
  );
}