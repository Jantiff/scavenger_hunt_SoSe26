import "./RoundIconButton.css";

export default function RoundIconButton({
  children,
  ariaLabel,
  onClick,
  type = "button",
  size = "medium",
  disabled = false,
  className = "",
}) {
  const buttonClassName = [
    "round-icon-button",
    `round-icon-button-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}