import { hintId } from "./Field";

export function Checkbox({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        aria-describedby={hint ? hintId(id) : undefined}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-sm font-semibold text-zinc-900">
          {label}
        </label>
        {hint && (
          <p id={hintId(id)} className="text-sm text-zinc-600">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
