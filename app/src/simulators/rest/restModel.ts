// A tiny in-memory REST API for orders, so the behaviour of each HTTP method
// can be tried and compared.

export interface Order {
  id: number
  item: string
  qty: number
}

export interface ApiStore {
  orders: Order[]
  nextId: number
}

export interface ApiRequest {
  method: string
  path: string
  body?: unknown
}

export interface ApiResponse {
  status: number
  reason: string
  body?: unknown
  /** Set on 201 responses. */
  location?: string
}

export const REASONS: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  404: 'Not Found',
  405: 'Method Not Allowed',
}

export const initialStore = (): ApiStore => ({
  orders: [
    { id: 1, item: 'candle', qty: 2 },
    { id: 2, item: 'diya', qty: 12 },
  ],
  nextId: 3,
})

const respond = (status: number, body?: unknown, location?: string): ApiResponse => ({ status, reason: REASONS[status], body, location })

function parseOrder(body: unknown): { item: string; qty: number } | null {
  if (!body || typeof body !== 'object') return null
  const { item, qty } = body as { item?: unknown; qty?: unknown }
  if (typeof item !== 'string' || item.trim() === '') return null
  if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) return null
  return { item: item.trim(), qty }
}

export function handle(store: ApiStore, req: ApiRequest): { store: ApiStore; res: ApiResponse } {
  const method = req.method.toUpperCase()
  const path = req.path.replace(/\/+$/, '') || '/'
  const m = /^\/orders(?:\/(\d+))?$/.exec(path)
  if (!m) return { store, res: respond(404, { error: `No route for ${path}` }) }
  const id = m[1] === undefined ? null : Number(m[1])

  if (id === null) {
    if (method === 'GET') return { store, res: respond(200, store.orders) }
    if (method === 'POST') {
      const o = parseOrder(req.body)
      if (!o) return { store, res: respond(400, { error: 'Send {"item": text, "qty": whole number of 1 or more}' }) }
      const created: Order = { id: store.nextId, ...o }
      return {
        store: { orders: [...store.orders, created], nextId: store.nextId + 1 },
        res: respond(201, created, `/orders/${created.id}`),
      }
    }
    return { store, res: respond(405, { error: `${method} is not allowed on /orders` }) }
  }

  const existing = store.orders.find((o) => o.id === id)
  if (method === 'GET') return { store, res: existing ? respond(200, existing) : respond(404, { error: `No order ${id}` }) }
  if (method === 'PUT') {
    if (!existing) return { store, res: respond(404, { error: `No order ${id}` }) }
    const o = parseOrder(req.body)
    if (!o) return { store, res: respond(400, { error: 'PUT replaces the whole order: send both item and qty' }) }
    const replaced: Order = { id, ...o }
    return { store: { ...store, orders: store.orders.map((x) => (x.id === id ? replaced : x)) }, res: respond(200, replaced) }
  }
  if (method === 'DELETE') {
    if (!existing) return { store, res: respond(404, { error: `No order ${id}` }) }
    return { store: { ...store, orders: store.orders.filter((x) => x.id !== id) }, res: respond(204) }
  }
  return { store, res: respond(405, { error: `${method} is not allowed on /orders/${id}` }) }
}

export function sameState(a: ApiStore, b: ApiStore): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
