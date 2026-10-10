// A small, honest model of a DNS lookup: who asks whom, what each layer
// caches, and for how long. Addresses are from documentation ranges and the
// latencies are typical, illustrative values.

export type DnsNode = 'browser' | 'os' | 'resolver' | 'root' | 'tld' | 'auth'

export interface Domain {
  name: string
  tld: string
  zone: string
  ip: string
  /** TTL of the A record, seconds. */
  ttl: number
}

export const DOMAINS: Domain[] = [
  { name: 'www.amazon.in', tld: 'in', zone: 'amazon.in', ip: '203.0.113.10', ttl: 60 },
  { name: 'api.uber.com', tld: 'com', zone: 'uber.com', ip: '198.51.100.24', ttl: 300 },
  { name: 'www.irctc.co.in', tld: 'in', zone: 'irctc.co.in', ip: '192.0.2.77', ttl: 3600 },
]

/** Round-trip times in milliseconds. */
export const RTT = { os: 0, resolver: 15, root: 25, tld: 30, auth: 45 } as const

/** TTLs for delegations (NS records), seconds. Root zone NS records use 2 days. */
export const TLD_NS_TTL = 172_800
export const ZONE_NS_TTL = 86_400
/** Browsers keep their own cache briefly, capped well below most TTLs. */
export const BROWSER_CAP = 60

export interface DnsCaches {
  browser: Record<string, number>
  os: Record<string, number>
  /** Keys like "A:www.amazon.in", "NS:in", "NS:amazon.in". */
  resolver: Record<string, number>
}

export const emptyCaches = (): DnsCaches => ({ browser: {}, os: {}, resolver: {} })

export interface DnsStep {
  from: DnsNode
  to: DnsNode
  /** What is said on this hop. */
  text: string
  /** Milliseconds this hop adds: a question carries its full round trip, the reply adds 0. */
  ms: number
  kind: 'query' | 'referral' | 'answer' | 'cache-hit' | 'cache-miss'
}

export interface Lookup {
  steps: DnsStep[]
  totalMs: number
  answeredBy: DnsNode
  caches: DnsCaches
}

const alive = (cache: Record<string, number>, key: string, now: number) => (cache[key] ?? -1) > now

/** Resolves `d` at time `now` (ms) and returns the hops plus updated caches. */
export function resolve(prev: DnsCaches, d: Domain, now: number): Lookup {
  const caches: DnsCaches = { browser: { ...prev.browser }, os: { ...prev.os }, resolver: { ...prev.resolver } }
  const steps: DnsStep[] = []
  const aKey = `A:${d.name}`

  if (alive(caches.browser, d.name, now)) {
    steps.push({ from: 'browser', to: 'browser', text: `Browser cache has ${d.name} → ${d.ip}`, ms: 0, kind: 'cache-hit' })
    return { steps, totalMs: 0, answeredBy: 'browser', caches }
  }
  steps.push({ from: 'browser', to: 'browser', text: 'Not in the browser cache', ms: 0, kind: 'cache-miss' })
  steps.push({ from: 'browser', to: 'os', text: `Ask the operating system for ${d.name}`, ms: 0, kind: 'query' })

  const cacheInBrowser = () => {
    caches.browser[d.name] = now + Math.min(d.ttl, BROWSER_CAP) * 1000
  }

  if (alive(caches.os, d.name, now)) {
    steps.push({ from: 'os', to: 'browser', text: `OS cache has it: ${d.ip}`, ms: 0, kind: 'cache-hit' })
    cacheInBrowser()
    return { steps, totalMs: 0, answeredBy: 'os', caches }
  }

  steps.push({ from: 'os', to: 'resolver', text: `Recursive query: "give me the final answer for ${d.name}"`, ms: RTT.resolver, kind: 'query' })

  if (alive(caches.resolver, aKey, now)) {
    steps.push({ from: 'resolver', to: 'os', text: `Resolver cache has it: ${d.ip}`, ms: 0, kind: 'cache-hit' })
  } else {
    if (!alive(caches.resolver, `NS:${d.zone}`, now)) {
      if (!alive(caches.resolver, `NS:${d.tld}`, now)) {
        steps.push({ from: 'resolver', to: 'root', text: `Where is ${d.name}?`, ms: RTT.root, kind: 'query' })
        steps.push({ from: 'root', to: 'resolver', text: `Don't know. Ask the .${d.tld} servers.`, ms: 0, kind: 'referral' })
        caches.resolver[`NS:${d.tld}`] = now + TLD_NS_TTL * 1000
      }
      steps.push({ from: 'resolver', to: 'tld', text: `Where is ${d.name}?`, ms: RTT.tld, kind: 'query' })
      steps.push({ from: 'tld', to: 'resolver', text: `Ask ${d.zone}'s nameservers.`, ms: 0, kind: 'referral' })
      caches.resolver[`NS:${d.zone}`] = now + ZONE_NS_TTL * 1000
    }
    steps.push({ from: 'resolver', to: 'auth', text: `What is the address of ${d.name}?`, ms: RTT.auth, kind: 'query' })
    steps.push({ from: 'auth', to: 'resolver', text: `${d.name} is ${d.ip}, TTL ${d.ttl}s`, ms: 0, kind: 'answer' })
    caches.resolver[aKey] = now + d.ttl * 1000
    steps.push({ from: 'resolver', to: 'os', text: `Answer: ${d.ip}`, ms: 0, kind: 'answer' })
  }

  caches.os[d.name] = now + d.ttl * 1000
  cacheInBrowser()
  steps.push({ from: 'os', to: 'browser', text: `Use ${d.ip}`, ms: 0, kind: 'answer' })
  const totalMs = steps.reduce((t, s) => t + s.ms, 0)
  const answeredBy = steps.some((s) => s.from === 'auth') ? 'auth' : 'resolver'
  return { steps, totalMs, answeredBy, caches }
}

/** Forget the device's caches (browser and OS), like restarting the machine. */
export function clearDevice(c: DnsCaches): DnsCaches {
  return { browser: {}, os: {}, resolver: { ...c.resolver } }
}
