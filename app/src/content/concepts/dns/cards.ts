import type { Card } from '../../types'

export const cards: Card[] = [
  {
    id: 'dns-k1',
    concept: 'dns',
    front: 'What problem does DNS solve?',
    back: 'It translates human-friendly names (amazon.in) into the IP addresses computers route by, and lets an address change while the name stays the same.',
  },
  {
    id: 'dns-k2',
    concept: 'dns',
    front: 'Which servers does an uncached lookup visit, in order?',
    back: 'Recursive resolver → root server → TLD server (.in) → the domain\'s authoritative nameserver.',
  },
  {
    id: 'dns-k3',
    concept: 'dns',
    front: 'Recursive vs iterative query?',
    back: "Recursive: \"give me the final answer\" (device → resolver). Iterative: \"give me the answer or tell me who to ask next\" (resolver → root, TLD, authoritative).",
  },
  {
    id: 'dns-k4',
    concept: 'dns',
    front: 'What does the TTL on a DNS record control?',
    back: 'How long caches may reuse the answer. Long TTL: fewer lookups, slow changes. Short TTL: fast changes and failover, more lookups.',
  },
  {
    id: 'dns-k5',
    concept: 'dns',
    front: 'A record vs CNAME?',
    back: 'An A record maps a name to an IPv4 address. A CNAME makes a name an alias of another name, which is then looked up.',
  },
  {
    id: 'dns-k6',
    concept: 'dns',
    front: 'Why does DNS use UDP for normal queries?',
    back: "A query and its answer each fit in one small packet, so skipping TCP's handshake saves a round trip. TCP is used for large answers and zone transfers.",
  },
  {
    id: 'dns-k7',
    concept: 'dns',
    front: 'Two ways to use DNS for traffic routing?',
    back: 'GeoDNS / latency-based routing (send users to the nearest region) and health-checked DNS failover (remove a failed region from the answers).',
  },
  {
    id: 'dns-k8',
    concept: 'dns',
    front: "Why can't DNS replace a load balancer?",
    back: "Answers are cached for the TTL and DNS doesn't see server health or load, so it can't move traffic quickly or evenly between servers.",
  },
  {
    id: 'dns-k9',
    concept: 'dns',
    front: "What should you do before changing a server's IP address?",
    back: 'Lower the record\'s TTL well ahead (at least one old TTL earlier), make the switch, then raise the TTL again.',
  },
]
