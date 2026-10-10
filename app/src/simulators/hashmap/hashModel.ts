// A hash map with separate chaining, small enough to see every bucket.
// The hash function is a toy (djb2); real maps use stronger ones.

export interface Entry {
  key: string
  value: string
}

export interface HashMap {
  buckets: Entry[][]
}

export function hashKey(key: string): number {
  let h = 5381
  for (const ch of key) h = ((h << 5) + h + (ch.codePointAt(0) ?? 0)) >>> 0
  return h
}

export const create = (bucketCount: number): HashMap => ({ buckets: Array.from({ length: bucketCount }, () => []) })

export const bucketOf = (map: HashMap, key: string) => hashKey(key) % map.buckets.length

export interface PutResult {
  map: HashMap
  bucket: number
  comparisons: number
  replaced: boolean
  /** The bucket already held a different key. */
  collided: boolean
}

export function put(map: HashMap, key: string, value: string): PutResult {
  const bucket = bucketOf(map, key)
  const chain = map.buckets[bucket]
  let comparisons = 0
  const at = chain.findIndex((e) => {
    comparisons++
    return e.key === key
  })
  const buckets = map.buckets.map((c) => c.slice())
  if (at >= 0) {
    buckets[bucket][at] = { key, value }
    return { map: { buckets }, bucket, comparisons, replaced: true, collided: false }
  }
  const collided = chain.length > 0
  buckets[bucket].push({ key, value })
  return { map: { buckets }, bucket, comparisons, replaced: false, collided }
}

export interface GetResult {
  found: Entry | null
  bucket: number
  comparisons: number
}

export function get(map: HashMap, key: string): GetResult {
  const bucket = bucketOf(map, key)
  let comparisons = 0
  const found =
    map.buckets[bucket].find((e) => {
      comparisons++
      return e.key === key
    }) ?? null
  return { found, bucket, comparisons }
}

export function remove(map: HashMap, key: string): { map: HashMap; removed: boolean; bucket: number } {
  const bucket = bucketOf(map, key)
  const removed = map.buckets[bucket].some((e) => e.key === key)
  const buckets = map.buckets.map((c, i) => (i === bucket ? c.filter((e) => e.key !== key) : c.slice()))
  return { map: { buckets }, removed, bucket }
}

export function resize(map: HashMap, bucketCount: number): HashMap {
  let next = create(bucketCount)
  for (const chain of map.buckets) for (const e of chain) next = put(next, e.key, e.value).map
  return next
}

export const size = (map: HashMap) => map.buckets.reduce((n, c) => n + c.length, 0)
export const longestChain = (map: HashMap) => Math.max(0, ...map.buckets.map((c) => c.length))
export const loadFactor = (map: HashMap) => size(map) / map.buckets.length
