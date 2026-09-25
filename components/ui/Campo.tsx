type Props = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
  placeholder?: string;
  erro?: string[];
};

export function Campo({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  autoFocus,
  placeholder,
  erro,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm text-muted-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
      />
      {erro?.map((mensagem) => (
        <p key={mensagem} className="text-xs text-accent">
          {mensagem}
        </p>
      ))}
    </div>
  );
}
