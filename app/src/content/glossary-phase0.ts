import type { GlossaryTerm } from './types.ts'

// Terms introduced by the Phase 0 lessons (M1).
export const phase0Terms: GlossaryTerm[] = [
  // ── Design vocabulary ──────────────────────────────────
  { id: 'scalability', label: 'Scalability', aliases: ['scalability', 'scalable'], oneLiner: 'How well a system keeps working as load grows, ideally by adding machines rather than rewriting it.', conceptId: 'what-is-system-design' },
  { id: 'reliability', label: 'Reliability', aliases: ['reliability', 'reliable'], oneLiner: 'The system does the right thing, consistently, even when parts of it fail.', conceptId: 'what-is-system-design' },
  { id: 'fault-tolerance', label: 'Fault tolerance', aliases: ['fault tolerance', 'fault-tolerant', 'fault tolerant'], oneLiner: 'The ability to keep serving users when a machine, disk or network link fails.', conceptId: 'what-is-system-design' },
  { id: 'redundancy', label: 'Redundancy', aliases: ['redundancy', 'redundant'], oneLiner: 'Keeping spare copies of a component so that one failure is not an outage.', conceptId: 'what-is-system-design' },
  { id: 'bottleneck', label: 'Bottleneck', aliases: ['bottleneck'], oneLiner: 'The one part that limits the whole system, like a narrow door in a busy hallway. Fix it and the next bottleneck appears.', conceptId: 'what-is-system-design' },
  { id: 'hld', label: 'High-level design (HLD)', aliases: ['HLD', 'high-level design'], oneLiner: 'The big picture: which services, databases, caches and queues exist and how data flows between them.', conceptId: 'what-is-system-design' },
  { id: 'lld', label: 'Low-level design (LLD)', aliases: ['LLD', 'low-level design'], oneLiner: 'The detail inside one service: classes, methods and how they interact. Also called machine coding or object-oriented design.', conceptId: 'what-is-system-design' },
  { id: 'three-tier', label: 'Three-tier architecture', aliases: ['three-tier', '3-tier', 'n-tier'], oneLiner: 'Client, application servers, database: each layer only talks to its neighbor.', conceptId: 'client-server' },
  { id: 'p2p', label: 'Peer-to-peer', aliases: ['peer-to-peer', 'P2P'], oneLiner: 'Every participant both asks and serves, with no central server. BitTorrent works this way.', conceptId: 'client-server' },
  { id: 'stateful', label: 'Stateful', aliases: ['stateful'], oneLiner: 'A server that remembers things between requests, such as who you are. It makes spreading load across servers harder.', conceptId: 'client-server' },

  // ── Networking ─────────────────────────────────────────
  { id: 'bandwidth', label: 'Bandwidth', aliases: ['bandwidth'], oneLiner: 'How much data a link can carry per second. Not the same as latency: a wide pipe can still be a long one.', conceptId: 'internet-basics' },
  { id: 'bits-per-second', label: 'Mbps and Gbps', aliases: ['bits per second', 'Kbps', 'Mbps', 'Gbps'], oneLiner: 'Network speeds are in bits per second. Divide by 8 to get bytes: 1 Gbps moves about 125 MB per second.', conceptId: 'internet-basics' },
  { id: 'rtt', label: 'Round trip (RTT)', aliases: ['round trip', 'round-trip', 'RTT', 'round-trip time'], oneLiner: 'The time for a message to reach the other side and for the reply to come back.', conceptId: 'internet-basics' },
  { id: 'router', label: 'Router', aliases: ['router'], oneLiner: 'A device that looks at a packet\'s destination address and passes it to the next device closer to it.', conceptId: 'internet-basics' },
  { id: 'hop', label: 'Hop', aliases: ['hop'], oneLiner: 'One router-to-router step on a packet\'s path. A trip across the internet is usually 10 to 20 hops.', conceptId: 'internet-basics' },
  { id: 'protocol', label: 'Protocol', aliases: ['protocol'], oneLiner: 'An agreed set of rules for a conversation: who speaks first, what the messages look like, what the replies mean.' },
  { id: 'localhost', label: 'localhost', aliases: ['localhost'], oneLiner: 'The name for "this same machine" (address 127.0.0.1). Used when a program talks to another program on the same computer.' },
  { id: 'private-ip', label: 'Private IP address', aliases: ['private IP', 'private IP address', 'private address'], oneLiner: 'An address like 192.168.1.5 that only works inside one local network and is not routable on the public internet.', conceptId: 'internet-basics' },
  { id: 'nat', label: 'NAT', aliases: ['NAT', 'network address translation'], oneLiner: 'Your router rewrites private addresses to its one public address, so many devices share it.', conceptId: 'internet-basics' },
  { id: 'traceroute', label: 'traceroute', aliases: ['traceroute', 'tracert'], oneLiner: 'A command that lists the routers between you and a destination, with the time to reach each one.', conceptId: 'internet-basics' },
  { id: 'sequence-number', label: 'Sequence number', aliases: ['sequence number'], oneLiner: 'A counter stamped on each packet or byte so the receiver can reorder them and spot gaps.', conceptId: 'tcp-udp' },
  { id: 'ack', label: 'Acknowledgment (ACK)', aliases: ['ACK', 'acknowledgment', 'acknowledgement'], oneLiner: 'A small reply meaning "I got it". When the sender hears none, it sends the data again.', conceptId: 'tcp-udp' },
  { id: 'retransmission', label: 'Retransmission', aliases: ['retransmission', 'retransmit', 'resend'], oneLiner: 'Sending the same data again because the receiver never confirmed it.', conceptId: 'tcp-udp' },
  { id: 'handshake', label: 'Handshake', aliases: ['handshake', 'three-way handshake', 'TCP handshake', 'TLS handshake'], oneLiner: 'The opening exchange where both sides agree how to talk before real data moves. It costs at least one round trip.', conceptId: 'tcp-udp' },
  { id: 'congestion-control', label: 'Congestion control', aliases: ['congestion control'], oneLiner: 'TCP slows down when it senses the network is overloaded, and speeds up when it is clear.', conceptId: 'tcp-udp' },
  { id: 'head-of-line', label: 'Head-of-line blocking', aliases: ['head-of-line blocking', 'head-of-line'], oneLiner: 'Everything behind a stuck item has to wait for it, even if it already arrived.', conceptId: 'tcp-udp' },
  { id: 'quic', label: 'QUIC', aliases: ['QUIC'], oneLiner: 'A modern transport built on UDP that adds reliability, encryption and multiple independent streams. HTTP/3 runs on it.', conceptId: 'tcp-udp' },

  // ── HTTP and APIs ──────────────────────────────────────
  { id: 'url', label: 'URL', aliases: ['URL'], oneLiner: 'A web address: scheme, host, optional port, path and query, like https://api.shop.in/orders?status=paid.', conceptId: 'http' },
  { id: 'http-message', label: 'HTTP request and response', aliases: ['HTTP request', 'HTTP response'], oneLiner: 'A request is a method, a path, headers and an optional body. A response is a status, headers and an optional body.', conceptId: 'http' },
  { id: 'status-code', label: 'Status code', aliases: ['status code', 'HTTP status code'], oneLiner: 'The three-digit number that starts a response. 2xx worked, 3xx redirect, 4xx your fault, 5xx the server\'s fault.', conceptId: 'http' },
  { id: 'http-get', label: 'GET', aliases: ['GET'], oneLiner: 'Read a resource. It must not change anything on the server, so it is safe to repeat or cache.', conceptId: 'http' },
  { id: 'http-post', label: 'POST', aliases: ['POST'], oneLiner: 'Send data to create something or trigger an action. Repeating it can create a second copy.', conceptId: 'http' },
  { id: 'http-put', label: 'PUT', aliases: ['PUT'], oneLiner: 'Replace a whole resource with the one you send. Repeating it gives the same result.', conceptId: 'http' },
  { id: 'http-patch', label: 'PATCH', aliases: ['PATCH'], oneLiner: 'Change part of a resource, such as one field.', conceptId: 'http' },
  { id: 'http-delete', label: 'DELETE', aliases: ['DELETE'], oneLiner: 'Remove a resource. Deleting it twice leaves the same end state.', conceptId: 'http' },
  { id: 'http-header', label: 'HTTP header', aliases: ['HTTP header', 'header'], oneLiner: 'A named line of metadata on a request or response: who you are, what format the body is, how long to cache it.', conceptId: 'http' },
  { id: 'cookie', label: 'Cookie', aliases: ['cookie'], oneLiner: 'A small value the server asks the browser to store and send back with every request, often a session id.', conceptId: 'http' },
  { id: 'encryption', label: 'Encryption', aliases: ['encryption', 'encrypted', 'encrypt'], oneLiner: 'Scrambling data so that only someone with the right key can read it.', conceptId: 'http' },
  { id: 'certificate', label: 'TLS certificate', aliases: ['TLS certificate', 'certificate authority', 'certificate'], oneLiner: 'A document, signed by a trusted authority, that ties a domain name to a public key so you know the server is the real one.', conceptId: 'http' },
  { id: 'crud', label: 'CRUD', aliases: ['CRUD'], oneLiner: 'Create, read, update, delete: the four basic things you do to stored data.', conceptId: 'api-basics' },
  { id: 'serialization', label: 'Serialization', aliases: ['serialization', 'serialize', 'serialized'], oneLiner: 'Turning an object in memory into bytes or text, such as JSON, that can be sent or stored.', conceptId: 'api-basics' },
  { id: 'api-key', label: 'API key', aliases: ['API key'], oneLiner: 'A secret string that identifies the calling application, sent with each request.', conceptId: 'api-basics' },
  { id: 'bearer-token', label: 'Bearer token', aliases: ['bearer token', 'access token'], oneLiner: 'A string issued at login that proves who you are. Whoever holds it ("bears" it) is treated as you.', conceptId: 'api-basics' },
  { id: 'openapi', label: 'OpenAPI', aliases: ['OpenAPI', 'Swagger'], oneLiner: 'A standard file format that describes an API\'s endpoints, inputs and outputs, from which docs and client code can be generated.', conceptId: 'api-basics' },
  { id: 'webhook', label: 'Webhook', aliases: ['webhook'], oneLiner: 'An API call that goes the other way: you give a service a URL and it calls you when something happens.', conceptId: 'api-basics' },

  // ── Concurrency ────────────────────────────────────────
  { id: 'cpu', label: 'CPU', aliases: ['CPU'], oneLiner: 'The processor that runs instructions. A modern server CPU has many cores, each able to run one thread at a time.', conceptId: 'processes-threads' },
  { id: 'context-switch', label: 'Context switch', aliases: ['context switch', 'context switching'], oneLiner: 'The operating system pausing one thread and resuming another. It takes a few microseconds, and too many add up.', conceptId: 'processes-threads' },
  { id: 'race-condition', label: 'Race condition', aliases: ['race condition'], oneLiner: 'A bug where the result depends on the exact timing of two threads touching the same data.', conceptId: 'processes-threads' },
  { id: 'mutex', label: 'Lock (mutex)', aliases: ['mutex', 'mutual exclusion', 'lock'], oneLiner: 'Only one thread at a time can hold it; the others wait. Used to protect data that several threads change.', conceptId: 'processes-threads' },
  { id: 'deadlock', label: 'Deadlock', aliases: ['deadlock'], oneLiner: 'Two threads each hold a lock the other needs, so both wait forever.', conceptId: 'processes-threads' },
  { id: 'event-loop', label: 'Event loop', aliases: ['event loop'], oneLiner: 'One thread that keeps picking up whichever task is ready next, never waiting on slow I/O. Node.js and Nginx work this way.', conceptId: 'processes-threads' },
  { id: 'async', label: 'Asynchronous', aliases: ['asynchronous', 'async'], oneLiner: 'Start an operation, carry on with other work, and handle the result when it arrives.', conceptId: 'processes-threads' },
  { id: 'blocking-io', label: 'Blocking I/O', aliases: ['blocking I/O', 'non-blocking I/O', 'non-blocking'], oneLiner: 'A call that makes the thread wait until the disk or network answers. Non-blocking calls return at once and report back later.', conceptId: 'processes-threads' },

  // ── Memory, disk and time ──────────────────────────────
  { id: 'time-units', label: 'ns, µs, ms', aliases: ['nanosecond', 'microsecond', 'millisecond'], oneLiner: 'A nanosecond is a billionth of a second, a microsecond a millionth, a millisecond a thousandth. Each step up is 1,000×.', conceptId: 'memory-disk-latency' },
  { id: 'cpu-cache', label: 'CPU cache', aliases: ['L1 cache', 'L2 cache', 'CPU cache'], oneLiner: 'A few megabytes of very fast memory on the processor chip that holds recently used data.', conceptId: 'memory-disk-latency' },
  { id: 'hdd', label: 'Hard disk (HDD)', aliases: ['HDD', 'hard disk', 'hard drive'], oneLiner: 'A spinning magnetic disk with a moving read head. Cheap per terabyte, slow at random access.', conceptId: 'memory-disk-latency' },
  { id: 'volatile', label: 'Volatile memory', aliases: ['volatile', 'non-volatile'], oneLiner: 'Memory that loses its contents when power is cut. RAM is volatile; SSDs and disks are non-volatile.', conceptId: 'memory-disk-latency' },
  { id: 'durability', label: 'Durability', aliases: ['durability', 'durable'], oneLiner: 'Once the system says "saved", the data survives a crash or power cut.', conceptId: 'databases-101' },
  { id: 'iops', label: 'IOPS', aliases: ['IOPS'], oneLiner: 'Input/output operations per second: how many separate reads or writes a disk can do.', conceptId: 'memory-disk-latency' },
  { id: 'sequential-access', label: 'Sequential vs random access', aliases: ['sequential read', 'sequential access', 'random read', 'random access'], oneLiner: 'Reading data stored next to each other is far faster than jumping between scattered places, especially on spinning disks.', conceptId: 'memory-disk-latency' },

  // ── Databases ──────────────────────────────────────────
  { id: 'foreign-key', label: 'Foreign key', aliases: ['foreign key'], oneLiner: 'A column that holds another table\'s primary key, linking the two. orders.customer_id points at customers.id.', conceptId: 'databases-101' },
  { id: 'schema', label: 'Schema', aliases: ['schema'], oneLiner: 'The declared structure of a database: its tables, columns, types and relationships.', conceptId: 'databases-101' },
  { id: 'sql-join', label: 'JOIN', aliases: ['JOIN', 'SQL join'], oneLiner: 'A SQL clause that combines rows from two tables where a key matches.', conceptId: 'databases-101' },
  { id: 'normalization', label: 'Normalization', aliases: ['normalization', 'normalized', 'denormalization', 'denormalized'], oneLiner: 'Storing each fact once and linking to it, instead of copying it into many rows. Denormalizing deliberately copies it back for faster reads.', conceptId: 'databases-101' },
  { id: 'full-table-scan', label: 'Full table scan', aliases: ['full table scan', 'table scan'], oneLiner: 'Reading every row of a table to find the matches. Fine for a hundred rows, painful for a hundred million.', conceptId: 'databases-101' },
  { id: 'connection-pool', label: 'Connection pool', aliases: ['connection pool'], oneLiner: 'A set of already-open database connections that requests borrow and return, because opening a connection is slow.', conceptId: 'databases-101' },
  { id: 'n-plus-one', label: 'N+1 queries', aliases: ['N+1 problem', 'N+1 queries', 'N+1'], oneLiner: 'Fetching a list with one query, then running one more query per item. 100 items means 101 round trips to the database.', conceptId: 'databases-101' },
  { id: 'orm', label: 'ORM', aliases: ['ORM'], oneLiner: 'A library that maps database rows to objects in your code, so you write method calls instead of SQL.', conceptId: 'databases-101' },

  // ── Data structures ────────────────────────────────────
  { id: 'queue', label: 'Queue', aliases: ['queue'], oneLiner: 'First in, first out: items leave in the order they arrived, like a line at a counter.', conceptId: 'data-structures' },
  { id: 'heap', label: 'Heap (priority queue)', aliases: ['priority queue', 'heap'], oneLiner: 'A structure that always hands you the smallest (or largest) item next, in O(log n) per operation.', conceptId: 'data-structures' },
  { id: 'trie', label: 'Trie', aliases: ['trie', 'prefix tree'], oneLiner: 'A tree where each step spells one more letter, so all words sharing a prefix share a path. Used for autocomplete.', conceptId: 'data-structures' },
  { id: 'hash-collision', label: 'Hash collision', aliases: ['hash collision', 'collision'], oneLiner: 'Two different keys that hash to the same bucket. Every hash map needs a way to deal with them.', conceptId: 'data-structures' },
  { id: 'load-factor', label: 'Load factor', aliases: ['load factor'], oneLiner: 'Keys divided by buckets. As it climbs, chains get longer, so maps resize when it passes about 0.75.', conceptId: 'data-structures' },
  { id: 'big-o', label: 'Big O', aliases: ['Big O', 'O(1)', 'O(n)', 'O(log n)'], oneLiner: 'How the work grows with the amount of data n: O(1) stays flat, O(log n) grows slowly, O(n) grows in step.', conceptId: 'data-structures' },

  // ── Estimation ─────────────────────────────────────────
  { id: 'dau', label: 'DAU', aliases: ['DAU', 'daily active users'], oneLiner: 'Daily active users: how many different people use the product in a day. The usual starting point of an estimate.', conceptId: 'estimation-basics' },
  { id: 'rps', label: 'Requests per second', aliases: ['RPS', 'requests per second'], oneLiner: 'The same idea as QPS: how many requests arrive each second.', conceptId: 'estimation-basics' },
  { id: 'peak-traffic', label: 'Peak traffic', aliases: ['peak traffic', 'peak load', 'peak QPS'], oneLiner: 'The busiest moment, usually 2 to 10 times the daily average. Systems are sized for this, not the average.', conceptId: 'estimation-basics' },
  { id: 'byte-units', label: 'KB, MB, GB, TB', aliases: ['KB', 'MB', 'GB', 'TB', 'PB'], oneLiner: 'Roughly a thousand, million, billion, trillion and quadrillion bytes. Each step is about 1,000 times the last.', conceptId: 'estimation-basics' },
  { id: 'byte', label: 'Byte', aliases: ['byte'], oneLiner: 'Eight bits: enough for one letter in plain English text.', conceptId: 'estimation-basics' },
  { id: 'order-of-magnitude', label: 'Order of magnitude', aliases: ['order of magnitude', 'orders of magnitude'], oneLiner: 'A factor of 10. "Same order of magnitude" means within a few times of each other.', conceptId: 'estimation-basics' },
]
