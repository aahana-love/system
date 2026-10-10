import { useState } from 'react'
import { handle, initialStore, sameState, type ApiRequest, type ApiResponse, type ApiStore } from './restModel'
import { Icon } from '../../components/Icon'

interface LogEntry {
  req: ApiRequest
  res: ApiResponse
  changed: boolean
  repeated: boolean
}

const PRESETS: { label: string; req: ApiRequest }[] = [
  { label: 'GET /orders', req: { method: 'GET', path: '/orders' } },
  { label: 'GET /orders/1', req: { method: 'GET', path: '/orders/1' } },
  { label: 'POST /orders', req: { method: 'POST', path: '/orders', body: { item: 'pen', qty: 3 } } },
  { label: 'PUT /orders/1', req: { method: 'PUT', path: '/orders/1', body: { item: 'book', qty: 5 } } },
  { label: 'DELETE /orders/2', req: { method: 'DELETE', path: '/orders/2' } },
  { label: 'GET /orders/99', req: { method: 'GET', path: '/orders/99' } },
]

const tone = (status: number) => (status < 300 ? 'text-good' : status < 500 ? 'text-miss' : 'text-bad')

/** A pretend order API. Send the same call twice and watch which methods are idempotent. */
export function RestSandbox() {
  const [store, setStore] = useState<ApiStore>(initialStore)
  const [log, setLog] = useState<LogEntry[]>([])
  const [method, setMethod] = useState('GET')
  const [path, setPath] = useState('/orders')
  const [body, setBody] = useState('{"item": "lamp", "qty": 1}')
  const [bodyError, setBodyError] = useState<string | null>(null)

  const send = (req: ApiRequest) => {
    const out = handle(store, req)
    const prev = log[0]
    const repeated = Boolean(prev && prev.req.method === req.method && prev.req.path === req.path && JSON.stringify(prev.req.body) === JSON.stringify(req.body))
    setStore(out.store)
    setLog((l) => [{ req, res: out.res, changed: !sameState(store, out.store), repeated }, ...l].slice(0, 6))
  }

  const sendCustom = () => {
    let parsed: unknown
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        parsed = JSON.parse(body)
        setBodyError(null)
      } catch {
        setBodyError('The body is not valid JSON.')
        return
      }
    }
    send({ method, path, body: parsed })
  }

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="REST API sandbox">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-extrabold">Order API sandbox</p>
        <button
          type="button"
          onClick={() => {
            setStore(initialStore())
            setLog([])
          }}
          className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink"
        >
          <Icon name="reset" size={14} /> Reset the server
        </button>
      </div>
      <p className="mt-1 text-sm text-ink-2">Click a request, or write your own. Then send the same one again.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => send(p.req)} className="rounded-lg border border-rule px-3 py-1.5 font-mono text-xs font-semibold hover:bg-surface-2">
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[auto_1fr_auto]">
        <select aria-label="Method" value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-lg border border-rule bg-surface px-2 py-2 font-mono text-sm font-bold">
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <input aria-label="Path" value={path} onChange={(e) => setPath(e.target.value)} className="rounded-lg border border-rule bg-surface px-3 py-2 font-mono text-sm" />
        <button type="button" onClick={sendCustom} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-bg">
          Send
        </button>
      </div>
      {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
        <div className="mt-2">
          <label className="text-xs font-bold tracking-wide text-ink-2 uppercase" htmlFor="rest-body">
            Body (JSON)
          </label>
          <textarea
            id="rest-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 font-mono text-sm"
          />
          {bodyError && <p className="text-sm font-semibold text-bad">{bodyError}</p>}
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">Calls so far, newest first</p>
          {log.length === 0 ? (
            <p className="mt-2 text-sm text-ink-3">No calls yet.</p>
          ) : (
            <ol className="mt-2 space-y-2">
              {log.map((e, i) => (
                <li key={log.length - i} className="rounded-lg border border-rule px-3 py-2 text-sm">
                  <p className="font-mono text-xs">
                    <strong>{e.req.method}</strong> {e.req.path}
                    {e.req.body !== undefined && <span className="text-ink-3"> {JSON.stringify(e.req.body)}</span>}
                  </p>
                  <p className={`font-mono text-sm font-bold ${tone(e.res.status)}`}>
                    {e.res.status} {e.res.reason}
                    {e.res.location && <span className="ml-2 font-normal text-ink-2">Location: {e.res.location}</span>}
                  </p>
                  {e.res.body !== undefined && <pre className="mt-1 overflow-x-auto font-mono text-xs text-ink-2">{JSON.stringify(e.res.body)}</pre>}
                  <p className="mt-1 text-xs text-ink-2">
                    {e.changed ? 'Changed the server’s data.' : 'Left the data as it was.'}
                    {e.repeated && (e.changed ? ' Repeating this call changed things again: not idempotent.' : ' Repeating this call changed nothing more: idempotent here.')}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">What the server holds</p>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[11px] text-ink-3 uppercase">
                <th className="py-1 font-normal">id</th>
                <th className="py-1 font-normal">item</th>
                <th className="py-1 font-normal">qty</th>
              </tr>
            </thead>
            <tbody>
              {store.orders.map((o) => (
                <tr key={o.id} className="border-t border-rule">
                  <td className="py-1 font-mono">{o.id}</td>
                  <td className="py-1">{o.item}</td>
                  <td className="py-1 font-mono">{o.qty}</td>
                </tr>
              ))}
              {store.orders.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-2 text-ink-3">
                    No orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </figure>
  )
}
