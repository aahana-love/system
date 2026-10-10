import type { Concept, Phase, PlannedStop } from './types.ts'

export const phases: Phase[] = [
  { id: 0, name: 'Absolute foundations', short: 'Foundations', milestone: 'M1' },
  { id: 1, name: 'Core building blocks', short: 'Building blocks', milestone: 'M2' },
  { id: 2, name: 'Distributed systems and reliability', short: 'Distributed systems', milestone: 'M3' },
  { id: 3, name: 'The interview method', short: 'Interview method', milestone: 'M4' },
  { id: 4, name: 'Classic designs', short: 'Classic designs', milestone: 'M5' },
  { id: 5, name: 'Company tracks: Uber and Amazon', short: 'Uber & Amazon', milestone: 'M6' },
  { id: 6, name: 'Low-level design and machine coding', short: 'Low-level design', milestone: 'M7' },
]

type C = Omit<Concept, 'ready'> & { ready?: boolean }

const list: C[] = [
  // ── Phase 0 ─────────────────────────────────────────────
  {
    id: 'what-is-system-design',
    title: 'What system design is',
    phase: 0,
    prerequisites: [],
    aliases: ['system design interview'],
    oneLiner: 'Deciding how the parts of a software system fit together so it stays fast, reliable and affordable as it grows.',
    primer:
      "Writing code solves one user's problem on one machine. System design is deciding what happens when millions of people use it at once: which servers, databases, caches and queues you need, how data flows between them, and what you give up with each choice. In an interview you get a vague prompt like \"design WhatsApp\". You're scored on how you clarify requirements, estimate scale, sketch a sensible architecture and reason about trade-offs, not on one right answer.",
    estMinutes: 25,
  },
  {
    id: 'client-server',
    title: 'Client–server model',
    phase: 0,
    prerequisites: [],
    aliases: ['client-server', 'client–server'],
    oneLiner: 'One side asks (the client), the other side answers (the server).',
    primer:
      'A client is any program that sends a request: your browser, the Uber app, another backend service. A server is a program that waits for requests and sends responses. They talk over a network using an agreed format, usually HTTP. Servers usually hold the shared data and rules; clients show results to people. One machine can be both: a backend server is a client when it calls a database.',
    estMinutes: 25,
  },
  {
    id: 'internet-basics',
    title: 'How the internet works',
    phase: 0,
    prerequisites: ['client-server'],
    aliases: ['how the internet works'],
    oneLiner: 'Data travels as small packets, routed hop by hop to an IP address.',
    primer:
      'Every device online has an IP address, like a postal address (IPv4 looks like 142.250.183.14). Data is cut into packets; each carries the destination address. Routers pass packets hop by hop toward that address, and different packets can take different paths. Ports pick which program on the machine gets the data (443 for HTTPS, 53 for DNS). TCP and UDP sit on top and decide whether delivery is checked and ordered.',
    estMinutes: 35,
  },
  {
    id: 'dns',
    title: 'DNS',
    phase: 0,
    prerequisites: ['client-server', 'internet-basics'],
    aliases: ['DNS', 'Domain Name System'],
    oneLiner: "The internet's distributed phone book: turns names like amazon.in into IP addresses.",
    primer:
      "Computers route traffic by IP address, but people remember names. DNS (Domain Name System) translates a name into an address. No single server knows every name: a resolver asks the root servers, which point to the servers for the top-level domain (.in, .com), which point to the domain's own nameservers, which hold the answer. Every answer is cached for a time called the TTL, so most lookups never make that full trip.",
    estMinutes: 40,
    ready: true,
  },
  {
    id: 'tcp-udp',
    title: 'TCP vs UDP',
    phase: 0,
    prerequisites: ['internet-basics'],
    aliases: ['TCP', 'UDP'],
    oneLiner: 'TCP delivers everything in order or retries; UDP just sends and hopes.',
    primer:
      'TCP opens a connection with a three-way handshake (SYN, SYN-ACK, ACK), numbers every byte, resends lost packets and delivers data in order. That reliability costs a round trip to set up and some delay when packets are lost. UDP has no connection and no retries: each datagram is sent once. It is used where speed beats completeness: DNS lookups, video calls, games. HTTP/3 builds its own reliability on top of UDP (QUIC).',
    estMinutes: 35,
  },
  {
    id: 'http',
    title: 'HTTP and HTTPS',
    phase: 0,
    prerequisites: ['tcp-udp', 'client-server'],
    aliases: ['HTTP', 'HTTPS', 'TLS'],
    oneLiner: "The request/response language of the web, encrypted by TLS when it's HTTPS.",
    primer:
      "An HTTP request has a method (GET reads, POST creates, PUT/PATCH update, DELETE removes), a path, headers and an optional body. The response has a status code (2xx success, 3xx redirect, 4xx the client's mistake, 5xx the server's mistake), headers and a body. HTTPS wraps the same conversation in TLS, which encrypts it and proves the server's identity with a certificate. HTTP/2 multiplexes many requests over one connection; HTTP/3 runs over QUIC on UDP.",
    estMinutes: 40,
  },
  {
    id: 'api-basics',
    title: 'APIs and REST basics',
    phase: 0,
    prerequisites: ['http'],
    aliases: ['API', 'REST', 'REST API', 'JSON', 'endpoint'],
    oneLiner: 'A contract for how programs ask each other for things.',
    primer:
      'An API is the set of requests a service accepts and what it returns. REST APIs model things as resources with URLs (/users/42/orders) and use HTTP methods for actions on them. Data usually travels as JSON, a text format of keys and values. A good API is predictable: consistent names, clear status codes, pagination for long lists, and versioning so old clients keep working.',
    estMinutes: 30,
  },
  {
    id: 'processes-threads',
    title: 'Processes, threads and concurrency',
    phase: 0,
    prerequisites: [],
    aliases: ['thread', 'threads', 'thread pool', 'concurrency'],
    oneLiner: 'How one machine juggles many tasks at once.',
    primer:
      "A process is a running program with its own memory. A thread is a path of execution inside a process; threads share the process's memory, which makes them cheap but lets them corrupt each other's data without locks. A server handles many requests at once with many threads, many processes, or an event loop that switches between tasks while they wait on the network or disk (Node.js, Nginx).",
    estMinutes: 30,
  },
  {
    id: 'memory-disk-latency',
    title: 'Memory vs disk, and latency numbers',
    phase: 0,
    prerequisites: [],
    aliases: ['latency numbers'],
    oneLiner: 'RAM is roughly 1,000× faster than SSD, and the network adds more. These ratios drive most design choices.',
    primer:
      'Rough numbers to keep in your head: reading RAM takes about 100 nanoseconds, a random read from an SSD around 100 microseconds (about 1,000× slower), a round trip inside one data center about 0.5 milliseconds, and a round trip across continents about 150 milliseconds. RAM is fast but small, expensive and wiped on restart; disks are big, cheap and durable. Caches, indexes and data placement all exist to avoid the slow trips.',
    estMinutes: 30,
  },
  {
    id: 'databases-101',
    title: 'Databases 101',
    phase: 0,
    prerequisites: [],
    aliases: ['database', 'SQL', 'primary key', 'relational database'],
    oneLiner: 'Organized, durable storage you can query: tables, rows, keys and SQL.',
    primer:
      "A database stores data so it survives restarts and can be searched efficiently. A relational database keeps data in tables of rows and columns; each row has a primary key that identifies it, and tables link through keys. You ask questions in SQL (SELECT name FROM users WHERE city = 'Nashik'). The database handles storage on disk, concurrent access and crash recovery so your application doesn't have to.",
    estMinutes: 35,
  },
  {
    id: 'data-structures',
    title: 'Data structures inside systems',
    phase: 0,
    prerequisites: [],
    aliases: ['hash map', 'hash table', 'B-tree', 'linked list', 'doubly linked list', 'hash function', 'hashing'],
    oneLiner: 'Hash maps, trees and queues are the parts real systems are built from.',
    primer:
      'A hash map finds a value by key in constant time by hashing the key to a slot; caches and in-memory indexes use them. A B-tree keeps keys sorted in wide, shallow nodes so a lookup on disk touches only a few pages; most database indexes are B-trees. A queue hands out items in arrival order; message brokers are queues spread over machines. A doubly linked list lets you move an item to the front in constant time, which is how LRU caches track recency.',
    estMinutes: 35,
  },
  {
    id: 'estimation-basics',
    title: 'Powers of two and estimation basics',
    phase: 0,
    prerequisites: ['memory-disk-latency'],
    aliases: ['powers of two'],
    oneLiner: 'Quick math with round numbers to size a system before designing it.',
    primer:
      '2^10 ≈ a thousand (KB), 2^20 ≈ a million (MB), 2^30 ≈ a billion (GB), 2^40 ≈ a trillion (TB). A day has 86,400 seconds; round it to 100,000 for quick math. So 1 million requests a day is about 12 per second on average, and peak traffic is often 2–10× the average. Estimation is not about exact answers. It tells you whether one server is enough or you need a thousand.',
    estMinutes: 30,
  },

  // ── Phase 1 ─────────────────────────────────────────────
  {
    id: 'scaling',
    title: 'Vertical vs horizontal scaling',
    phase: 1,
    prerequisites: ['client-server'],
    aliases: ['horizontal scaling', 'vertical scaling', 'scale out', 'scale up', 'stateless'],
    oneLiner: 'Buy a bigger machine, or add more machines.',
    primer:
      "Vertical scaling means a bigger server: more CPU, RAM, faster disks. It's simple but has a ceiling and keeps a single point of failure. Horizontal scaling means more servers sharing the load behind a load balancer. It grows almost without limit but needs servers to be stateless: any server can handle any request because session data lives in a shared store, not in one server's memory.",
    estMinutes: 30,
  },
  {
    id: 'latency-throughput-availability',
    title: 'Latency, throughput and availability',
    phase: 1,
    prerequisites: ['memory-disk-latency'],
    aliases: ['latency', 'throughput', 'availability', 'SLA', 'SLO', 'SLI', 'p99', 'nines'],
    oneLiner: "How fast one request is, how many you can handle, and how often you're up.",
    primer:
      "Latency is the time one request takes; measure percentiles like p99 (99% of requests are faster than this) because averages hide slow outliers. Throughput is how many requests per second the system handles. Availability is the share of time it works: 99.9% (\"three nines\") allows about 8.8 hours of downtime a year, 99.99% about 53 minutes. An SLO is the target you set; an SLA is a promise with penalties.",
    estMinutes: 35,
  },
  {
    id: 'load-balancers',
    title: 'Load balancers',
    phase: 1,
    prerequisites: ['scaling', 'http'],
    aliases: ['load balancer', 'load balancing', 'round robin', 'health check'],
    oneLiner: 'Spreads incoming requests across servers and skips the broken ones.',
    primer:
      "A load balancer sits in front of a group of servers and picks one for each request, using rules like round robin, least connections or a hash of the client. It runs health checks and stops sending traffic to servers that fail them. Layer 4 balancers route by IP and port without reading the request; Layer 7 balancers read HTTP and can route by path, header or cookie. The balancer itself is made redundant so it isn't a single point of failure.",
    estMinutes: 40,
  },
  {
    id: 'proxies-gateways',
    title: 'Reverse proxy and API gateway',
    phase: 1,
    prerequisites: ['load-balancers'],
    aliases: ['reverse proxy', 'API gateway', 'forward proxy'],
    oneLiner: 'A front door that handles TLS, routing, auth and limits before requests reach services.',
    primer:
      'A reverse proxy (Nginx, Envoy) receives requests on behalf of servers: it terminates TLS, compresses, caches and forwards. An API gateway is a reverse proxy with product features: it authenticates users, applies rate limits, routes /orders to the orders service and /payments to payments, and collects metrics. A forward proxy is the opposite: it acts for clients going out, like a company proxy.',
    estMinutes: 30,
  },
  {
    id: 'caching',
    title: 'Caching',
    phase: 1,
    prerequisites: ['memory-disk-latency', 'databases-101', 'data-structures', 'latency-throughput-availability'],
    aliases: ['cache', 'caching', 'cached'],
    oneLiner: 'Keep a copy of hot data somewhere faster so most requests skip the slow trip.',
    primer:
      "A cache stores copies of data that's expensive to fetch or compute, usually in memory. When the data is there (a hit) you answer in under a millisecond; when it isn't (a miss) you go to the database and usually save the result for next time. Caches can sit in the browser, a CDN, the application or a shared store like Redis. The hard parts are deciding what to evict when it's full and keeping copies from going stale.",
    estMinutes: 55,
    ready: true,
  },
  {
    id: 'cdn',
    title: 'CDN',
    phase: 1,
    prerequisites: ['caching', 'dns'],
    aliases: ['CDN', 'content delivery network', 'edge server'],
    oneLiner: 'Copies of your static files on servers near your users.',
    primer:
      'A content delivery network runs servers in hundreds of cities. Images, videos, scripts and other static files are cached there, so a user in Nashik downloads from a nearby edge server instead of your origin in Virginia. That cuts latency and takes load off your servers. DNS or anycast steers each user to a nearby edge. Push CDNs get files uploaded ahead of time; pull CDNs fetch from the origin on the first miss.',
    estMinutes: 30,
  },
  {
    id: 'sql-deep',
    title: 'Indexes, transactions and ACID',
    phase: 1,
    prerequisites: ['databases-101', 'data-structures'],
    aliases: ['index', 'transaction', 'ACID', 'isolation level'],
    oneLiner: 'How databases find rows fast and keep data correct under concurrent writes.',
    primer:
      "An index is a sorted structure (usually a B-tree) on one or more columns, so the database finds matching rows without scanning the whole table; it speeds reads and slows writes. A transaction groups changes so they all happen or none do. ACID: Atomic (all or nothing), Consistent (rules hold), Isolated (concurrent transactions don't see each other's half-done work), Durable (committed data survives crashes). Isolation levels trade safety for speed.",
    estMinutes: 45,
  },
  {
    id: 'nosql',
    title: 'NoSQL families',
    phase: 1,
    prerequisites: ['databases-101'],
    aliases: ['NoSQL', 'key-value store', 'document database', 'wide-column', 'graph database'],
    oneLiner: 'Key-value, document, wide-column and graph stores, each built for a different access pattern.',
    primer:
      "NoSQL databases drop some relational features to scale or fit data better. Key-value stores (Redis, DynamoDB) look up a value by key, very fast. Document stores (MongoDB) keep JSON-like documents with flexible fields. Wide-column stores (Cassandra, Bigtable) handle huge write volumes spread across many machines. Graph databases (Neo4j) follow relationships like 'friends of friends'. Pick based on how you'll read and write the data.",
    estMinutes: 40,
  },
  {
    id: 'replication',
    title: 'Replication',
    phase: 1,
    prerequisites: ['databases-101', 'scaling'],
    aliases: ['replication', 'replica', 'leader-follower', 'read replica'],
    oneLiner: 'Keep copies of the same data on several machines.',
    primer:
      'Replication copies data to multiple nodes so you survive machine failures and can spread reads. In leader-follower setups, one leader takes writes and streams changes to followers that serve reads. If replication is asynchronous, followers lag and can return stale data. Multi-leader and leaderless designs accept writes in several places, which helps availability but means conflicting writes must be resolved.',
    estMinutes: 45,
  },
  {
    id: 'sharding',
    title: 'Partitioning and sharding',
    phase: 1,
    prerequisites: ['replication', 'data-structures'],
    aliases: ['sharding', 'shard', 'partitioning', 'partition key', 'shard key'],
    oneLiner: 'Split data across machines so no single machine holds or serves it all.',
    primer:
      'When data or traffic outgrows one machine, you split it into shards, each on its own server. Range sharding keeps ordered key ranges together (A–F, G–M), good for range scans but prone to hot spots. Hash sharding spreads keys evenly but scatters ranges. The shard key decides everything: choose one that spreads load and keeps queries on one shard. Moving data when you add shards is called resharding.',
    estMinutes: 45,
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent hashing',
    phase: 1,
    prerequisites: ['sharding', 'data-structures'],
    aliases: ['consistent hashing', 'hash ring', 'virtual nodes'],
    oneLiner: 'Place servers and keys on a ring so adding a server moves only a small share of keys.',
    primer:
      'With hash(key) % N, changing N from 4 to 5 moves about 80% of keys, a disaster for a cache. Consistent hashing places servers and keys on a circle of hash values; each key belongs to the next server clockwise. Adding a server only takes keys from its neighbor, about 1/N of the total. Virtual nodes (many points per server) even out the load. Used by Dynamo, Cassandra and many caches.',
    estMinutes: 40,
  },
  {
    id: 'cap-pacelc',
    title: 'CAP theorem and PACELC',
    phase: 1,
    prerequisites: ['replication'],
    aliases: ['CAP theorem', 'CAP', 'PACELC', 'network partition'],
    oneLiner: 'During a network split you must choose: answer possibly stale, or refuse to answer.',
    primer:
      "CAP says that when a network partition splits your nodes, a replicated system can stay Consistent (every read sees the latest write, so some requests must fail) or Available (every request gets an answer, maybe stale), not both. Partitions aren't optional, so the real choice is CP or AP. PACELC adds the everyday case: Else, with no partition, you trade Latency against Consistency. Banks lean CP; shopping carts and feeds lean AP.",
    estMinutes: 35,
  },
  {
    id: 'consistency-models',
    title: 'Consistency models',
    phase: 1,
    prerequisites: ['replication', 'cap-pacelc'],
    aliases: ['eventual consistency', 'strong consistency', 'read-your-writes', 'eventually consistent', 'strongly consistent', 'causal consistency'],
    oneLiner: 'The promises a system makes about how fresh the data you read is.',
    primer:
      'Strong consistency (linearizability) means every read returns the most recent write, as if there were one copy. Eventual consistency means replicas converge if writes stop, but a read may be stale for a while. In between: read-your-writes (you always see your own updates), monotonic reads (you never go back in time), and causal consistency (a reply is never seen before the message it answers). Stronger guarantees cost latency and availability.',
    estMinutes: 40,
  },
  {
    id: 'message-queues',
    title: 'Message queues and pub/sub',
    phase: 1,
    prerequisites: ['client-server'],
    aliases: ['message queue', 'pub/sub', 'publish-subscribe', 'message broker'],
    oneLiner: 'Producers drop messages in; consumers take them out later, at their own pace.',
    primer:
      "A message queue decouples the service that creates work from the service that does it. The producer sends a message and moves on; consumers process it when they can, so traffic spikes are absorbed and a slow consumer doesn't block users. In pub/sub, one message goes to every subscriber. Delivery is usually at-least-once, so consumers must handle duplicates. Examples: Amazon SQS, RabbitMQ, Kafka.",
    estMinutes: 40,
  },
  {
    id: 'streams-kafka',
    title: 'Event streams and Kafka',
    phase: 1,
    prerequisites: ['message-queues', 'sharding'],
    aliases: ['Kafka', 'consumer group', 'offset', 'event stream'],
    oneLiner: 'An append-only log of events that many consumers can read and replay.',
    primer:
      'Kafka stores messages in topics, each split into partitions: ordered, append-only logs spread across brokers. Messages stay for a set retention period, so consumers can replay history. Each consumer tracks its position with an offset. A consumer group shares a topic\'s partitions among its members, so adding members adds throughput (up to one per partition). Order is guaranteed only within a partition, so related events share a partition key.',
    estMinutes: 45,
  },
  {
    id: 'api-design',
    title: 'API design: REST, gRPC, GraphQL',
    phase: 1,
    prerequisites: ['api-basics'],
    aliases: ['gRPC', 'GraphQL', 'pagination', 'idempotency key', 'API versioning'],
    oneLiner: 'Choosing the API style and rules that keep clients fast and safe.',
    primer:
      "REST over HTTP and JSON is simple and works everywhere. gRPC sends compact binary messages over HTTP/2 with generated clients; it's common between internal services. GraphQL lets the client ask for exactly the fields it needs in one request, useful for mobile apps with many screens. Whatever the style: paginate long lists (cursors beat page numbers at scale), version your API, and accept an idempotency key on writes so a retried payment isn't charged twice.",
    estMinutes: 40,
  },
  {
    id: 'realtime',
    title: 'Real-time: polling, SSE, WebSockets',
    phase: 1,
    prerequisites: ['http', 'tcp-udp'],
    aliases: ['WebSocket', 'long polling', 'SSE', 'server-sent events', 'polling'],
    oneLiner: 'Four ways for a server to get fresh data to a client quickly.',
    primer:
      "Polling: the client asks every few seconds, simple but wasteful. Long polling: the client asks and the server holds the request open until there's news. Server-sent events: one long-lived HTTP response streams updates from server to client. WebSockets: a persistent two-way connection, used for chat, live location and multiplayer games. Persistent connections are cheap per message but each one holds memory on a server, which shapes how you scale.",
    estMinutes: 35,
  },
  {
    id: 'rate-limiting',
    title: 'Rate limiting',
    phase: 1,
    prerequisites: ['api-design'],
    aliases: ['rate limiting', 'rate limiter', 'token bucket', 'leaky bucket', 'sliding window'],
    oneLiner: 'Cap how many requests a client can make in a time window.',
    primer:
      "Rate limits protect services from abuse, bugs and overload, and stop one customer from starving others. Token bucket: a bucket refills at a steady rate and each request spends a token, allowing short bursts. Leaky bucket: requests drain at a fixed rate. Fixed window counts per minute but allows a double burst at window edges; sliding window fixes that. Over the limit, return HTTP 429 with a Retry-After header. Distributed limiters keep counters in a shared store like Redis.",
    estMinutes: 40,
  },
  {
    id: 'storage-types',
    title: 'Object, block and file storage',
    phase: 1,
    prerequisites: ['databases-101'],
    aliases: ['object storage', 'blob storage', 'S3', 'block storage', 'file storage'],
    oneLiner: 'Where big files live: object stores like S3, disks, and shared file systems.',
    primer:
      "Object storage (Amazon S3) stores files as objects addressed by key, with metadata. It's cheap, nearly unlimited and very durable, and it's where photos, videos, backups and logs go. You read and write whole objects over HTTP instead of editing bytes in place. Block storage is a raw virtual disk attached to one server, used for databases. File storage is a shared file system several servers can mount. Databases store the object's key, not the file itself.",
    estMinutes: 30,
  },
  {
    id: 'search-index',
    title: 'Search and the inverted index',
    phase: 1,
    prerequisites: ['sql-deep'],
    aliases: ['inverted index', 'full-text search', 'Elasticsearch'],
    oneLiner: 'Map every word to the documents containing it, so text search is fast.',
    primer:
      "A normal index finds rows by exact value; text search needs documents containing words. An inverted index maps each term to the list of documents that contain it, like the index at the back of a book. Text is first split into tokens, lowercased and reduced to roots ('running' → 'run'). Results are ranked by relevance (for example BM25). Elasticsearch and OpenSearch shard the index across nodes and are usually fed from the main database asynchronously.",
    estMinutes: 35,
  },
  {
    id: 'unique-ids',
    title: 'Unique ID generation',
    phase: 1,
    prerequisites: ['sharding'],
    aliases: ['Snowflake ID', 'UUID'],
    oneLiner: 'Making IDs that never collide, across many machines, without a central counter.',
    primer:
      "A single auto-increment column breaks once you have many database shards. UUIDs (128-bit random) need no coordination but are long and unordered, which hurts index locality. Twitter's Snowflake packs a timestamp, a machine ID and a per-machine sequence into 64 bits, so IDs are unique, roughly time-ordered and generated locally. Another option is a ticket server that hands out ID ranges in blocks.",
    estMinutes: 30,
  },
  {
    id: 'estimation',
    title: 'Back-of-envelope estimation',
    phase: 1,
    prerequisites: ['estimation-basics', 'latency-throughput-availability'],
    aliases: ['back-of-envelope', 'back-of-the-envelope', 'capacity estimation', 'QPS'],
    oneLiner: 'Turn users into requests per second, storage and bandwidth in a few lines of math.',
    primer:
      'Start from daily active users and actions per user to get requests per day; divide by about 100,000 seconds for average QPS and multiply by 2–10 for peak. Multiply writes by object size and retention to get storage; multiply QPS by response size to get bandwidth. Compare the results with what one machine can do (thousands to tens of thousands of simple requests per second) to decide how many servers, shards or cache nodes you need.',
    estMinutes: 45,
  },

  // ── Phase 2 ─────────────────────────────────────────────
  {
    id: 'distributed-failures',
    title: 'Why distributed systems fail',
    phase: 2,
    prerequisites: ['internet-basics', 'replication'],
    aliases: ['partial failure', 'fallacies of distributed computing', 'distributed system'],
    oneLiner: 'Networks drop, delay and split; machines pause and die. Design for it.',
    primer:
      "In one process, a function call either works or crashes. Across a network, a request can be lost, delayed, duplicated, or processed while the reply is lost, and you can't tell which. Machines pause (garbage collection, VM migration) and come back thinking no time passed. The 'fallacies of distributed computing' list the comfortable false assumptions: the network is reliable, latency is zero, bandwidth is infinite. Every pattern in this phase exists to cope with these.",
    estMinutes: 35,
  },
  {
    id: 'retries-backoff',
    title: 'Timeouts, retries and backoff',
    phase: 2,
    prerequisites: ['distributed-failures'],
    aliases: ['timeout', 'retry', 'retries', 'exponential backoff', 'jitter', 'idempotent', 'idempotency'],
    oneLiner: 'Wait a bounded time, retry a few times with growing random gaps, and make retries safe.',
    primer:
      'Every network call needs a timeout, or one slow dependency ties up all your threads. Retries fix brief failures but can multiply load during an outage, so retry only a few times, with exponential backoff (wait 100 ms, 200, 400…) and jitter (randomize the waits so clients do not retry in sync). Only retry operations that are idempotent, meaning doing them twice has the same effect as once, or make them idempotent with request IDs.',
    estMinutes: 35,
  },
  {
    id: 'resilience-patterns',
    title: 'Circuit breakers and load shedding',
    phase: 2,
    prerequisites: ['retries-backoff'],
    aliases: ['circuit breaker', 'bulkhead', 'load shedding', 'graceful degradation'],
    oneLiner: "Stop calling what's broken, isolate failures, and drop work before you fall over.",
    primer:
      "A circuit breaker counts failures to a dependency; past a threshold it opens and fails fast for a while instead of waiting on timeouts, then lets a few test requests through. Bulkheads give each dependency its own pool of threads or connections so one slow service can't exhaust everything. Load shedding rejects excess requests early (HTTP 503) to keep serving the rest. Graceful degradation serves a simpler result, like a feed without recommendations, when parts fail.",
    estMinutes: 35,
  },
  {
    id: 'quorums',
    title: 'Quorums (N, R, W)',
    phase: 2,
    prerequisites: ['replication', 'consistency-models'],
    aliases: ['quorum', 'sloppy quorum', 'hinted handoff'],
    oneLiner: 'With N copies, write to W and read from R; if R + W > N, reads see the latest write.',
    primer:
      'Leaderless stores like Dynamo and Cassandra send each write to all N replicas and wait for W acknowledgments; reads ask R replicas and take the newest value. If R + W > N, the read set and the write set overlap in at least one replica, so you see the latest write under normal conditions. N=3, W=2, R=2 is common. Lower W or R means faster and more available, but possibly stale. Sloppy quorums and hinted handoff keep accepting writes when some replicas are down.',
    estMinutes: 35,
  },
  {
    id: 'consensus-raft',
    title: 'Leader election and consensus (Raft)',
    phase: 2,
    prerequisites: ['replication', 'distributed-failures'],
    aliases: ['consensus', 'Raft', 'leader election', 'ZooKeeper', 'etcd', 'Paxos'],
    oneLiner: 'Getting a group of machines to agree on one value or one leader, even when some fail.',
    primer:
      'Consensus lets nodes agree on a sequence of decisions despite crashes and network delays. In Raft, nodes elect a leader by majority vote for a numbered term; the leader appends commands to its log, and a command is committed once a majority has stored it. If the leader dies, a new election happens. A majority is needed, so 5 nodes tolerate 2 failures. etcd and ZooKeeper use consensus to store configuration, locks and leader information for other services.',
    estMinutes: 45,
  },
  {
    id: 'clocks-ordering',
    title: 'Time, clocks and ordering',
    phase: 2,
    prerequisites: ['distributed-failures'],
    aliases: ['vector clock', 'Lamport clock', 'last-write-wins', 'LWW', 'CRDT', 'clock skew'],
    oneLiner: 'Machine clocks disagree, so ordering events needs logical clocks.',
    primer:
      "Server clocks drift and get corrected, so timestamps from two machines can't be trusted to order events. Last-write-wins by timestamp silently drops writes when clocks skew. A Lamport clock is a counter that increments on every event and jumps ahead on receiving a higher value, giving an order consistent with cause and effect. Vector clocks keep one counter per node and can detect that two writes were concurrent, so the conflict can be resolved. CRDTs are data types that merge concurrent updates automatically.",
    estMinutes: 40,
  },
  {
    id: 'gossip-failure-detection',
    title: 'Gossip and failure detection',
    phase: 2,
    prerequisites: ['distributed-failures'],
    aliases: ['gossip protocol', 'gossip', 'heartbeat'],
    oneLiner: 'Nodes spread membership news like rumors and detect dead peers by their silence.',
    primer:
      "In a big cluster, a central registry can become a bottleneck. With gossip, every second each node tells a few random peers what it knows (who's alive, versions of data); news reaches everyone in a number of rounds that grows only logarithmically with cluster size. Failure detectors watch heartbeats: miss enough and a node is suspected dead. Cassandra and Uber's Ringpop use gossip for membership.",
    estMinutes: 30,
  },
  {
    id: 'distributed-transactions',
    title: 'Distributed transactions: 2PC, Saga, outbox',
    phase: 2,
    prerequisites: ['sql-deep', 'distributed-failures'],
    aliases: ['two-phase commit', '2PC', 'saga', 'outbox pattern', 'compensating transaction'],
    oneLiner: 'Keeping data correct when one action spans several services or databases.',
    primer:
      "Two-phase commit has a coordinator ask every participant to prepare, then commit only if all said yes; it's correct but slow, and it blocks if the coordinator dies. A saga splits the work into local transactions, each with a compensating action (refund, release the seat) run if a later step fails, so it's eventually consistent rather than atomic. The outbox pattern writes the business change and the event to publish in one local transaction, so they can't drift apart.",
    estMinutes: 45,
  },
  {
    id: 'exactly-once',
    title: 'Exactly-once processing and dedup',
    phase: 2,
    prerequisites: ['message-queues', 'retries-backoff'],
    aliases: ['exactly-once', 'at-least-once', 'at-most-once', 'deduplication', 'dedup'],
    oneLiner: 'Networks deliver at least once or at most once; exactly-once effects are built with dedup.',
    primer:
      "If you don't retry, messages can be lost (at-most-once). If you retry until acknowledged, some arrive twice (at-least-once). Exactly-once delivery isn't possible over an unreliable network, but exactly-once effects are: give every message a unique ID and have the consumer record processed IDs in the same transaction as its work, or make the operation idempotent. Kafka transactions give exactly-once within Kafka pipelines.",
    estMinutes: 35,
  },
  {
    id: 'event-driven',
    title: 'Event-driven architecture, event sourcing, CQRS',
    phase: 2,
    prerequisites: ['streams-kafka'],
    aliases: ['event sourcing', 'CQRS', 'event-driven'],
    oneLiner: 'Services react to events, and state can be rebuilt from the event log.',
    primer:
      "In event-driven systems, services publish facts ('OrderPlaced') and others react, instead of calling each other directly; this cuts coupling but makes flows harder to trace. Event sourcing stores every change as an immutable event and derives current state by replaying them, giving a full audit trail. CQRS separates the write model from read models, so reads use views shaped for each screen, updated from events.",
    estMinutes: 40,
  },
  {
    id: 'microservices',
    title: 'Monolith vs microservices',
    phase: 2,
    prerequisites: ['api-design', 'load-balancers'],
    aliases: ['microservice', 'monolith', 'service discovery', 'service mesh'],
    oneLiner: 'One deployable app, or many small services owned by separate teams.',
    primer:
      'A monolith is one codebase deployed as one unit: simple to build, test and debug, and usually right for small teams. Microservices split the system into services that own their data and deploy independently, so large organizations can move in parallel, at the cost of network calls, partial failures and harder debugging. Service discovery tells services where each other live; a service mesh adds retries, encryption and metrics between them.',
    estMinutes: 35,
  },
  {
    id: 'storage-engines',
    title: 'Storage engines: B-tree vs LSM tree',
    phase: 2,
    prerequisites: ['sql-deep', 'data-structures'],
    aliases: ['LSM tree', 'SSTable', 'write-ahead log', 'WAL', 'compaction', 'memtable'],
    oneLiner: 'Update pages in place, or append and merge later. That choice sets read and write speed.',
    primer:
      'B-tree engines (PostgreSQL, MySQL InnoDB) update fixed-size pages in place, which is good for reads, with a write-ahead log for crash safety. LSM-tree engines (Cassandra, RocksDB) buffer writes in memory (a memtable), flush them as sorted immutable files (SSTables), and merge files in the background (compaction). LSM trees take very high write rates; reads may check several files, helped by Bloom filters.',
    estMinutes: 40,
  },
  {
    id: 'probabilistic-ds',
    title: 'Bloom filters and other sketches',
    phase: 2,
    prerequisites: ['data-structures'],
    aliases: ['Bloom filter', 'HyperLogLog', 'count-min sketch'],
    oneLiner: "Tiny structures that answer 'seen it?' or 'how many?' approximately.",
    primer:
      "A Bloom filter is a bit array with several hash functions. It answers 'definitely not present' or 'probably present' using very little memory, so databases use it to skip files that can't contain a key. HyperLogLog estimates how many unique items you've seen (daily unique visitors) in about 12 KB at roughly 1% error. Count-min sketch estimates how often each item appears, for things like trending hashtags.",
    estMinutes: 35,
  },
  {
    id: 'geospatial',
    title: 'Geospatial indexing',
    phase: 2,
    prerequisites: ['data-structures', 'sharding'],
    aliases: ['geohash', 'quadtree', 'H3', 'S2', 'geospatial index'],
    oneLiner: "Index locations so 'find drivers within 2 km' doesn't scan every driver.",
    primer:
      "Latitude and longitude don't fit a normal index for 'nearby' queries. Geohash encodes a location as a string where a shared prefix means nearby, so a nearby search becomes a prefix lookup plus neighboring cells. A quadtree splits busy areas into smaller squares. Google's S2 maps the sphere onto cells. Uber built H3, which covers the earth in hexagons because every hexagon's neighbors are the same distance away. That makes it useful for dispatch and surge pricing.",
    estMinutes: 45,
  },
  {
    id: 'batch-stream',
    title: 'Batch vs stream processing, OLTP vs OLAP',
    phase: 2,
    prerequisites: ['streams-kafka', 'nosql'],
    aliases: ['OLTP', 'OLAP', 'MapReduce', 'Spark', 'Flink', 'stream processing', 'batch processing', 'data warehouse'],
    oneLiner: 'Serving users vs analyzing data, and processing it in batches vs as it arrives.',
    primer:
      'OLTP databases serve the app: many small reads and writes by key. OLAP systems (data warehouses like Redshift and BigQuery) scan billions of rows for analytics and store data by column. Batch processing (MapReduce, Spark) runs over a large fixed dataset every hour or day. Stream processing (Flink, Kafka Streams) handles events as they arrive, for fraud alerts and live dashboards. Lambda architecture runs both; kappa uses only streams.',
    estMinutes: 40,
  },
  {
    id: 'observability',
    title: 'Observability',
    phase: 2,
    prerequisites: ['microservices'],
    aliases: ['observability', 'distributed tracing', 'alerting'],
    oneLiner: 'Logs, metrics and traces tell you what broke, where and why.',
    primer:
      "Logs are timestamped records of events, good for details. Metrics are numbers over time (request rate, error rate, p99 latency, CPU), cheap to store and good for dashboards and alerts. Distributed traces follow one request across every service it touches, showing where the time went. Alert on symptoms users feel (errors, latency) against your SLOs, not on every CPU spike. You can't fix what you can't see.",
    estMinutes: 30,
  },
  {
    id: 'security',
    title: 'Security basics',
    phase: 2,
    prerequisites: ['http', 'api-basics'],
    aliases: ['authentication', 'authorization', 'OAuth', 'OAuth2', 'JWT', 'OIDC', 'DDoS'],
    oneLiner: 'Prove who users are, control what they can do, and protect data everywhere.',
    primer:
      'Authentication proves identity (passwords, OTP, passkeys); authorization decides what that identity may do. Sessions store login state on the server behind a cookie; JWTs are signed tokens the client carries, easy to verify anywhere but hard to revoke early. OAuth 2.0 lets an app act on your behalf without your password, and OIDC adds login on top. Encrypt data in transit (TLS) and at rest, keep secrets out of code, and absorb DDoS floods at the edge.',
    estMinutes: 40,
  },
  {
    id: 'deployment',
    title: 'Containers, Kubernetes and deployments',
    phase: 2,
    prerequisites: ['scaling'],
    aliases: ['container', 'Docker', 'Kubernetes', 'autoscaling', 'canary', 'blue-green', 'feature flag'],
    oneLiner: 'Package services, run them on a cluster, and release changes without downtime.',
    primer:
      'A container packages an app with its dependencies so it runs the same everywhere (Docker). Kubernetes schedules containers across machines, restarts failed ones and scales them with load. Releases are where many outages start, so ship gradually: blue-green keeps the old version ready to switch back to, canary releases send a few percent of traffic to the new version first, and feature flags turn code paths on without redeploying.',
    estMinutes: 35,
  },
  {
    id: 'multi-region',
    title: 'Multi-region and disaster recovery',
    phase: 2,
    prerequisites: ['replication', 'dns'],
    aliases: ['multi-region', 'active-active', 'active-passive', 'RPO', 'RTO', 'failover', 'disaster recovery'],
    oneLiner: 'Survive losing a whole data center, and decide how much data and time you can lose.',
    primer:
      'One region can fail completely (power, network, a bad deploy). Active-passive keeps a standby region ready to take over; active-active serves users from several regions at once and must handle cross-region data conflicts. RPO is how much recent data you can afford to lose; RTO is how long you can be down. Lower numbers need synchronous replication and automated failover, which cost latency and money.',
    estMinutes: 35,
  },
  {
    id: 'distributed-locks',
    title: 'Distributed locks and leases',
    phase: 2,
    prerequisites: ['consensus-raft', 'clocks-ordering'],
    aliases: ['distributed lock', 'lease', 'fencing token'],
    oneLiner: 'Make sure only one worker does a job, even when machines pause and clocks drift.',
    primer:
      "A distributed lock lets one node at a time do something, like charging a card or running a nightly job. Locks are usually leases that expire, so a crashed holder doesn't block others forever. The danger: a holder can pause (garbage collection, network) past its lease while another node takes the lock, and then both act. Fencing tokens fix that: each grant carries an increasing number, and storage rejects writes with an older token. Use a consensus system (etcd, ZooKeeper) for locks that must be correct.",
    estMinutes: 35,
  },
  {
    id: 'hot-keys-fanout',
    title: 'Hot keys, thundering herds and fan-out',
    phase: 2,
    prerequisites: ['caching', 'sharding'],
    aliases: ['hot key', 'celebrity problem', 'fan-out', 'fan-out on write', 'fan-out on read', 'hot spot', 'hot partition'],
    oneLiner: 'When one key or one user gets far more traffic than the rest.',
    primer:
      "Even sharded systems melt if one key is very popular: a viral post, a celebrity's profile, a flash-sale item. Fixes: cache it close to users, replicate it, or split the key into several sub-keys. Fan-out on write pushes a new post into every follower's feed at write time, so reads are fast but a celebrity with 100 million followers creates 100 million writes. Fan-out on read assembles the feed when it's opened. Real systems mix both.",
    estMinutes: 40,
  },

  // ── Phase 3 ─────────────────────────────────────────────
  {
    id: 'interview-framework',
    title: 'The interview framework',
    phase: 3,
    prerequisites: ['estimation'],
    aliases: ['interview framework'],
    oneLiner: 'A repeatable 45-minute path from a vague prompt to a defended design.',
    primer:
      'Spend about 5 minutes on requirements (features, number of users, what matters most), 5 on estimation, 5 on the API, 5 on the data model, 10–15 on a high-level diagram, and the rest on deep dives into the hardest parts, then wrap up with bottlenecks and trade-offs. Say your plan out loud at the start. Interviewers score the process: clarifying, structuring, reasoning about trade-offs and adjusting to hints.',
    estMinutes: 40,
  },
  {
    id: 'requirements',
    title: 'Functional vs non-functional requirements',
    phase: 3,
    prerequisites: ['interview-framework'],
    aliases: ['functional requirements', 'non-functional requirements'],
    oneLiner: 'What the system does, and how well it must do it.',
    primer:
      "Functional requirements are features: users can post a photo, follow others, see a feed. Non-functional requirements are qualities: 200 ms p99 feed load, 99.99% availability, eventual consistency is fine for likes, durability for photos, 100 million daily users. Non-functional requirements drive the architecture, so pin them down early with numbers. Also agree on what's out of scope so you don't design the whole company.",
    estMinutes: 30,
  },
  {
    id: 'data-modeling',
    title: 'Data modeling and choosing storage',
    phase: 3,
    prerequisites: ['nosql', 'sql-deep', 'requirements'],
    aliases: ['data model', 'data modeling', 'access pattern'],
    oneLiner: 'Start from how data is read and written, then pick the store and the keys.',
    primer:
      "List the entities (User, Post, Follow) and the queries the product needs ('latest 20 posts by people I follow'). Those access patterns decide the store: relational for transactions and flexible queries, key-value or wide-column for huge simple lookups, object storage for media, a search index for text, a cache for hot reads. Then choose primary keys and shard keys that keep each common query on one partition.",
    estMinutes: 40,
  },
  {
    id: 'trade-offs',
    title: 'Driving the conversation and stating trade-offs',
    phase: 3,
    prerequisites: ['interview-framework'],
    aliases: ['trade-off'],
    oneLiner: "Every choice costs something. Say what, and why it's worth it here.",
    primer:
      "There's rarely a right answer, only choices with costs. State the options, pick one, and tie the reason to a requirement: 'Feeds can be a few seconds stale, so I'll use async fan-out and a cache, trading freshness for read speed.' Lead the discussion but check in with the interviewer; treat hints as changed requirements, not attacks. When challenged, explain what would make you change your mind.",
    estMinutes: 30,
  },
  {
    id: 'interview-scoring',
    title: "How you're scored, and common mistakes",
    phase: 3,
    prerequisites: ['interview-framework'],
    aliases: [],
    oneLiner: 'What interviewers look for at each level, and the mistakes that sink candidates.',
    primer:
      'Interviewers usually rate problem exploration, design breadth, depth in a few areas, trade-off reasoning and communication. Junior candidates are expected to build a working design with some guidance; senior candidates should drive, spot bottlenecks themselves and go deep. Common mistakes: jumping into boxes before requirements, naming technologies without reasons, ignoring scale numbers, going silent, and over-engineering parts nobody asked about.',
    estMinutes: 25,
  },
]

export const concepts: Concept[] = list.map((c) => ({ ...c, ready: c.ready ?? false }))

export const conceptById = new Map(concepts.map((c) => [c.id, c]))

export const plannedStops: PlannedStop[] = [
  ...['URL shortener', 'Pastebin', 'Rate limiter', 'Unique ID generator', 'Key-value store', 'Distributed cache'].map(
    (title) => ({ title, phase: 4 as const, tier: 'Easy' as const }),
  ),
  ...[
    'Notification system', 'News feed', 'Chat (WhatsApp)', 'Typeahead', 'Web crawler', 'Instagram', 'Leaderboard',
    'Proximity service (Yelp)', 'Google Drive / Dropbox', 'YouTube / Netflix', 'Ticket booking (BookMyShow)',
    'Hotel reservation', 'Metrics monitoring', 'Ad click aggregator',
  ].map((title) => ({ title, phase: 4 as const, tier: 'Medium' as const })),
  ...['Distributed message queue', 'Payment system', 'Stock exchange', 'Google Maps'].map((title) => ({
    title, phase: 4 as const, tier: 'Hard' as const,
  })),
  ...[
    'Ride-hailing end to end', 'Real-time location tracking', 'Dispatch and matching', 'Surge pricing',
    'Uber Eats delivery', "Uber's own infrastructure",
  ].map((title) => ({ title, phase: 5 as const, tier: 'Uber' as const })),
  ...[
    'E-commerce end to end', 'Inventory under flash sales', 'Checkout and order pipeline', 'Recommendations',
    'Dynamo, S3 and SQS', 'Leadership Principles in design',
  ].map((title) => ({ title, phase: 5 as const, tier: 'Amazon' as const })),
  ...['OOP and SOLID', 'UML class diagrams', 'Concurrency in LLD'].map((title) => ({ title, phase: 6 as const, tier: 'Basics' as const })),
  ...['Strategy, Observer, Factory', 'Singleton, Builder, Decorator', 'State, Command, Adapter'].map((title) => ({
    title, phase: 6 as const, tier: 'Patterns' as const,
  })),
  ...[
    'Parking lot', 'Elevator', 'Splitwise', 'LRU cache', 'Rate limiter (LLD)', 'Vending machine', 'BookMyShow (LLD)',
    'Snake and ladder', 'Logger', 'Pub-sub', 'Library system', 'Amazon Locker', 'Rider–driver matching', 'Tic-tac-toe', 'Cab booking',
  ].map((title) => ({ title, phase: 6 as const, tier: 'Problems' as const })),
]
