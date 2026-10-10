import type { Card } from '../../types'

export const cards: Card[] = [
  {
    id: 'caching-k1',
    concept: 'caching',
    front: 'Why do caches work so well?',
    back: 'Memory is far faster than a database, and access is skewed: a small set of hot items gets most of the reads.',
  },
  {
    id: 'caching-k2',
    concept: 'caching',
    front: 'Average latency with a cache-aside cache?',
    back: 'hit ratio × cache time + miss ratio × (cache time + DB time). With 90% hits, 1 ms cache and 20 ms DB: 3 ms.',
  },
  {
    id: 'caching-k3',
    concept: 'caching',
    front: 'Cache-aside in one line?',
    back: 'Check the cache; on a miss, read the database, store the result with a TTL, and return it.',
  },
  {
    id: 'caching-k4',
    concept: 'caching',
    front: 'Write-through vs write-back?',
    back: 'Write-through writes cache and database before acknowledging: consistent, slower writes. Write-back writes the cache and flushes later: fast, but unflushed writes can be lost.',
  },
  {
    id: 'caching-k5',
    concept: 'caching',
    front: 'When is write-around the right choice?',
    back: "For data written once and rarely read (logs, uploads): write only to the database so it doesn't push hot items out of the cache.",
  },
  {
    id: 'caching-k6',
    concept: 'caching',
    front: 'After a database update, delete or update the cache key?',
    back: 'Delete. Concurrent updates can leave an older value in the cache; deleting makes the next read load fresh data. Keep a TTL as a safety net.',
  },
  {
    id: 'caching-k7',
    concept: 'caching',
    front: 'Cache stampede: cause and fixes?',
    back: 'A hot key expires and many requests miss at once. Fixes: request coalescing, stale-while-revalidate, refreshing hot keys early.',
  },
  {
    id: 'caching-k8',
    concept: 'caching',
    front: 'How do you stop cache penetration?',
    back: 'Cache "not found" results briefly (negative caching), or check a Bloom filter of existing keys before the database.',
  },
  {
    id: 'caching-k9',
    concept: 'caching',
    front: 'How do you prevent a cache avalanche?',
    back: 'Add random jitter to TTLs so keys never expire together, and warm the cache before sending it traffic.',
  },
  {
    id: 'caching-k10',
    concept: 'caching',
    front: 'How is an O(1) LRU cache built?',
    back: 'A hash map from key to node, plus a doubly linked list ordered by recency: move a node to the front on access, evict from the back when full.',
  },
  {
    id: 'caching-k11',
    concept: 'caching',
    front: 'Redis vs Memcached?',
    back: 'Redis: rich data types, optional persistence, built-in replication. Memcached: a simple, multi-threaded key-value cache with no persistence.',
  },
]
