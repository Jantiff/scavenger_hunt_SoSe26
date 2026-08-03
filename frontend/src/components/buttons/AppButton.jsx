import "./AppButton.css";

export default function AppButton({
  children,
  icon = null,
  variant = "neutral",
  type = "button",
  onClick,
  disabled = false,
  fullWidth = false,
  className = "",
  ...buttonProps
}) {
  const buttonClassName = [
    "app-button",
    `app-button-${variant}`,
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