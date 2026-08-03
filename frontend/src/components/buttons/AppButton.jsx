import "./AppButton.css";

const VALID_BUTTON_SIZES = new Set([
  "small",
  "medium",
  "large",
]);

export default function AppButton({
  children,
  icon = null,
  variant = "neutral",
  size = "medium",
  type = "button",
  onClick,
  disabled = false,
  fullWidth = false,
  className = "",
  ...buttonProps
}) {
  const resolvedSize = VALID_BUTTON_SIZES.has(size)
    ? size
    : "medium";

  const buttonClassName = [
    "app-button",
    `app-button-${variant}`,
    `app-button-${resolvedSize}`,
    fullWidth ? "app-button-full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...buttonProps}
      type={type}
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
    >
      <span
        className="app-button-icon"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="app-button-label">
        {children}
      </span>
      <span
        className="app-button-balance"
        aria-hidden="true"
      />
    </button>
  );
}