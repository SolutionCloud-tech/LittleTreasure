/** Labelled text input with an error message tied to it for screen readers. */
export function Field({
  label,
  name,
  error,
  className = "",
  ...rest
}: { label: string; name: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        className={`field ${error ? "border-coral focus:border-coral focus:ring-coral/10" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-coral-deep">
          {error}
        </p>
      )}
    </div>
  );
}
