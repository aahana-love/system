// Two small tables and a query builder, so SQL clauses can be seen doing their work.

export interface Customer {
  id: number
  name: string
  tier: 'gold' | 'silver'
}

export interface OrderRow {
  id: number
  customerId: number
  city: string
  item: string
  amount: number
  status: 'paid' | 'pending' | 'refunded'
}

export const CUSTOMERS: Customer[] = [
  { id: 1, name: 'Asha', tier: 'gold' },
  { id: 2, name: 'Ravi', tier: 'silver' },
  { id: 3, name: 'Meera', tier: 'gold' },
  { id: 4, name: 'Imran', tier: 'silver' },
  { id: 5, name: 'Sneha', tier: 'silver' },
]

export const ORDERS: OrderRow[] = [
  { id: 101, customerId: 1, city: 'Nashik', item: 'Candle set', amount: 450, status: 'paid' },
  { id: 102, customerId: 2, city: 'Pune', item: 'Diya pack', amount: 180, status: 'paid' },
  { id: 103, customerId: 3, city: 'Mumbai', item: 'Vase', amount: 1200, status: 'pending' },
  { id: 104, customerId: 1, city: 'Nashik', item: 'Tray', amount: 760, status: 'paid' },
  { id: 105, customerId: 4, city: 'Pune', item: 'Planter', amount: 950, status: 'refunded' },
  { id: 106, customerId: 5, city: 'Mumbai', item: 'Candle set', amount: 450, status: 'paid' },
  { id: 107, customerId: 2, city: 'Nashik', item: 'Lamp', amount: 1850, status: 'paid' },
  { id: 108, customerId: 3, city: 'Pune', item: 'Diya pack', amount: 180, status: 'pending' },
  { id: 109, customerId: 4, city: 'Mumbai', item: 'Tray', amount: 760, status: 'paid' },
  { id: 110, customerId: 5, city: 'Nashik', item: 'Vase', amount: 1200, status: 'paid' },
  { id: 111, customerId: 1, city: 'Pune', item: 'Lamp', amount: 1850, status: 'pending' },
  { id: 112, customerId: 3, city: 'Nashik', item: 'Planter', amount: 950, status: 'paid' },
]

export const CITIES = ['Nashik', 'Pune', 'Mumbai'] as const
export const STATUSES = ['paid', 'pending', 'refunded'] as const

export interface QueryOptions {
  city: string | 'any'
  status: string | 'any'
  minAmount: number
  orderBy: 'none' | 'id' | 'amount' | 'city'
  dir: 'ASC' | 'DESC'
  limit: number | null
  join: boolean
}

export interface QueryResult {
  sql: string
  columns: string[]
  rows: (string | number)[][]
  examined: number
  matched: number
}

export const defaultQuery: QueryOptions = { city: 'any', status: 'any', minAmount: 0, orderBy: 'none', dir: 'ASC', limit: null, join: false }

export function runQuery(q: QueryOptions): QueryResult {
  const conditions: string[] = []
  if (q.city !== 'any') conditions.push(`${q.join ? 'orders.' : ''}city = '${q.city}'`)
  if (q.status !== 'any') conditions.push(`${q.join ? 'orders.' : ''}status = '${q.status}'`)
  if (q.minAmount > 0) conditions.push(`${q.join ? 'orders.' : ''}amount >= ${q.minAmount}`)

  const columns = q.join
    ? ['orders.id', 'customers.name', 'customers.tier', 'orders.city', 'orders.amount', 'orders.status']
    : ['id', 'customer_id', 'city', 'item', 'amount', 'status']

  const lines = [`SELECT ${columns.join(', ')}`]
  lines.push(q.join ? 'FROM orders\nJOIN customers ON orders.customer_id = customers.id' : 'FROM orders')
  if (conditions.length) lines.push(`WHERE ${conditions.join('\n  AND ')}`)
  if (q.orderBy !== 'none') lines.push(`ORDER BY ${q.join ? 'orders.' : ''}${q.orderBy} ${q.dir}`)
  if (q.limit !== null) lines.push(`LIMIT ${q.limit}`)
  const sql = `${lines.join('\n')};`

  let matched = ORDERS.filter(
    (o) => (q.city === 'any' || o.city === q.city) && (q.status === 'any' || o.status === q.status) && o.amount >= q.minAmount,
  )
  if (q.orderBy !== 'none') {
    const key = q.orderBy
    const sign = q.dir === 'ASC' ? 1 : -1
    matched = matched.slice().sort((a, b) => {
      const x = a[key]
      const y = b[key]
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))
      return (c || a.id - b.id) * sign
    })
  }
  const total = matched.length
  if (q.limit !== null) matched = matched.slice(0, q.limit)

  const rows = matched.map((o) => {
    if (!q.join) return [o.id, o.customerId, o.city, o.item, o.amount, o.status]
    const c = CUSTOMERS.find((x) => x.id === o.customerId)!
    return [o.id, c.name, c.tier, o.city, o.amount, o.status]
  })
  return { sql, columns: columns.map((c) => c.replace(/^\w+\./, '')), rows, examined: ORDERS.length, matched: total }
}
