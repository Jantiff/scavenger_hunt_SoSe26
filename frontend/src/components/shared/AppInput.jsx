import "./AppInput.css";

export default function AppInput({
  type = "text",
  value,
  onChange,
  placeholder = "",
  name,
  autoComplete,
  required = false,
  disabled = false,
  className = "",
  ...inputProps
}) {
  const inputClassName = [
    "app-input",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      {...inputProps}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      disabled={disabled}
      className={inputClassName}
      aria-label={inputProps["aria-label"] || placeholder}
    />
  );
}