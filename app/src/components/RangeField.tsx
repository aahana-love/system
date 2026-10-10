/** A slider over a fixed list of values (so odd numbers like 100,000,000 stay easy to pick). */
export function RangeField({
  label,
  values,
  value,
  onChange,
  format = (v) => String(v),
  hint,
}: {
  label: string
  values: number[]
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  hint?: string
}) {
  const idx = Math.max(0, values.indexOf(value))
  return (
    <label className="block">
      <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">
        {label}: <span className="font-mono text-ink normal-case">{format(value)}</span>
      </span>
      <input
        type="range"
        min={0}
        max={values.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(values[Number(e.target.value)])}
        aria-valuetext={format(value)}
        className="mt-2 block w-full accent-[var(--ink)]"
      />
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  )
}
