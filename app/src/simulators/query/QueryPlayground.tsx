import { useMemo, useState } from 'react'
import { CITIES, STATUSES, defaultQuery, runQuery, type QueryOptions } from './queryModel'

const select = 'rounded-lg border border-rule bg-surface px-2 py-1.5 text-sm font-semibold'

/** Build a query from controls and watch the SQL and the rows change together. */
export function QueryPlayground() {
  const [q, setQ] = useState<QueryOptions>(defaultQuery)
  const set = <K extends keyof QueryOptions>(k: K, v: QueryOptions[K]) => setQ((o) => ({ ...o, [k]: v }))
  const r = useMemo(() => runQuery(q), [q])

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="SQL query playground">
      <p className="text-lg font-extrabold">Query playground: the orders table</p>

      <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-3 text-sm">
        <label className="block">
          <span className="block text-xs font-bold tracking-wide text-ink-2 uppercase">City</span>
          <select className={select} value={q.city} onChange={(e) => set('city', e.target.value)}>
            <option value="any">any</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-bold tracking-wide text-ink-2 uppercase">Status</span>
          <select className={select} value={q.status} onChange={(e) => set('status', e.target.value)}>
            <option value="any">any</option>
            {STATUSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-bold tracking-wide text-ink-2 uppercase">Amount at least</span>
          <select className={select} value={q.minAmount} onChange={(e) => set('minAmount', Number(e.target.value))}>
            {[0, 500, 1000, 1500].map((v) => (
              <option key={v} value={v}>
                {v === 0 ? 'any' : `₹${v}`}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-bold tracking-wide text-ink-2 uppercase">Sort by</span>
          <span className="flex gap-1">
            <select className={select} value={q.orderBy} onChange={(e) => set('orderBy', e.target.value as QueryOptions['orderBy'])}>
              <option value="none">no order</option>
              <option value="amount">amount</option>
              <option value="city">city</option>
              <option value="id">id</option>
            </select>
            <select className={select} value={q.dir} disabled={q.orderBy === 'none'} onChange={(e) => set('dir', e.target.value as QueryOptions['dir'])} aria-label="Direction">
              <option value="ASC">ASC</option>
              <option value="DESC">DESC</option>
            </select>
          </span>
        </label>
        <label className="block">
          <span className="block text-xs font-bold tracking-wide text-ink-2 uppercase">Limit</span>
          <select className={select} value={q.limit ?? 'none'} onChange={(e) => set('limit', e.target.value === 'none' ? null : Number(e.target.value))}>
            <option value="none">all rows</option>
            <option value="3">3</option>
            <option value="5">5</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pb-1.5 font-semibold">
          <input type="checkbox" checked={q.join} onChange={(e) => set('join', e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
          Join the customers table
        </label>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-xl border border-rule bg-surface-2 px-4 py-3 font-mono text-sm leading-relaxed" aria-label="Generated SQL">
        {r.sql}
      </pre>

      <p className="mt-3 text-sm text-ink-2" role="status">
        The database looked at <strong className="text-ink">{r.examined}</strong> rows and found <strong className="text-ink">{r.matched}</strong> that match
        {q.limit !== null && r.matched > q.limit ? `, then kept the first ${q.limit}` : ''}.
      </p>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-ink text-left font-mono text-[11px] tracking-wider uppercase">
              {r.columns.map((c) => (
                <th key={c} className="py-1.5 pr-4 font-normal">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.rows.map((row, i) => (
              <tr key={i} className="border-b border-rule">
                {row.map((v, j) => (
                  <td key={j} className="py-1.5 pr-4 font-mono tabular-nums">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
            {r.rows.length === 0 && (
              <tr>
                <td colSpan={r.columns.length} className="py-3 text-ink-3">
                  No rows match. Loosen a filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
