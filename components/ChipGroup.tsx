import { describedBy, Fieldset } from "./Field";

// A row of tappable chips that is really a native radio group: arrow keys move
// between options, Tab leaves the group, and screen readers announce the legend.

export function chipId(name: string, value: string) {
  return `${name}-${value}`;
}

export function ChipGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onValueChange,
  optional,
  hint,
  error,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string }[];
  value: T | "";
  onValueChange: (value: T) => void;
  optional?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <Fieldset id={name} legend={legend} optional={optional} hint={hint} error={error}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              id={chipId(name, option.value)}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onValueChange(option.value)}
              aria-describedby={describedBy(name, hint, error)}
              className="peer sr-only"
            />
            <span
              className={
                "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors " +
                "border-line-strong bg-surface text-ink hover:bg-subtle " +
                "peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white " +
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
              }
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </Fieldset>
  );
}
