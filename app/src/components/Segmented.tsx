/** A row of mutually exclusive options, used for simulator settings. */
export function Segmented<T extends string | number | null>({
  label,
  value,
  options,
  display = (v) => String(v),
  onChange,
}: {
  label: string
  value: T
  options: T[]
  display?: (v: T) => string
  onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label}>
      <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">{label}</span>
      <div className="mt-1.5 flex rounded-lg border border-rule p-0.5">
        {options.map((o) => (
          <button
            key={String(o)}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className={`flex-1 rounded-md px-2 py-1 text-sm font-semibold ${value === o ? 'bg-ink text-bg' : 'text-ink-2 hover:text-ink'}`}
          >
            {display(o)}
          </button>
        ))}
      </div>
    </div>
  )
}
