# System Design Study App: Plan

Written 2026-10-10. Status: **M0 built and tested on 2026-10-10** (foundation, plus the DNS and Caching lessons). Next: M1. How to run it: [README.md](README.md).

---

## 1. Goal

Take you from zero to passing system design rounds (HLD and LLD) at Uber/Amazon-level companies. The vehicle is a web app that teaches every concept in the same fixed order:

**prerequisites → learn → theory → practice → review**

Out of scope: DSA rounds, and behavioral rounds beyond a short Amazon Leadership Principles guide. One honest note: at **SDE-1** level, DSA and LLD count more than HLD. At **SDE-2** and above, HLD and LLD decide the offer. This plan covers HLD to SDE-2 depth, plus LLD.

---

## 2. How every concept is taught

This is the core of the app. You asked for "if a concept comes up, study it first, then theory, then practice." Every concept page runs this loop:

| Step | What happens | Unlock rule |
|---|---|---|
| **0. Prerequisite gate** | Before you start, the page lists the concepts this one depends on. Example: Consistent Hashing needs Hashing and Sharding. Any you haven't done get a **Study it first** button or a 2-minute primer. | You can skip, but it gets logged |
| **Inline concept links** | Every technical term inside any lesson is a link. Hover shows a one-line definition. Click opens a side drawer with a mini primer, and closing it returns you to where you were. Drawers stack, so you can go Kafka → Partition → Hashing and back. | none |
| **1. Learn (intuition)** | A real-life analogy, then an interactive simulator you play with. 5–10 minutes. Ends with 3 quick check questions. | Pass the 3 checks |
| **2. Theory (depth)** | How it works, variants, a trade-off table, real numbers, failure modes, how Uber/Amazon-scale systems use it, and "how to say it in an interview". | Read through |
| **3. Practice** | 10–20 mixed questions: scenarios, estimation, ordering, spot-the-fault, simulator tasks. Each answer comes with an explanation. Wrong answers go to your Mistakes notebook. | 80% marks it *practiced* |
| **4. Review (memory)** | The concept's flashcards join your daily review queue, scheduled by FSRS (the spaced-repetition algorithm Anki uses). | Stable recall marks it *mastered* |

---

## 3. The roadmap (syllabus)

About **60 concepts, 24 classic designs, 12 company-track designs and 15 LLD problems**. Target: about **1,500 practice questions and 600 flashcards** by the end.

### Phase 0: Absolute foundations (12)
1. What system design is, and what interviewers actually test
2. Client–server model
3. How the internet works: IP, packets, routers, ports
4. DNS: how a name becomes an address
5. TCP vs UDP: handshake, reliability, when to use each
6. HTTP/HTTPS: methods, status codes, headers, TLS, HTTP/1.1 vs 2 vs 3
7. APIs and REST basics, JSON
8. Processes, threads, concurrency basics
9. Memory vs disk, and the latency numbers every engineer should know
10. Databases 101: tables, keys, SQL (this ties into your SQL course)
11. Data structures inside systems: hash maps, B-trees, queues
12. Powers of two, units, first estimation drills

### Phase 1: Core building blocks (22)
13. Vertical vs horizontal scaling, stateless services
14. Latency, throughput, availability (the "nines"), SLA/SLO/SLI
15. Load balancers: L4 vs L7, algorithms, health checks
16. Reverse proxy and API gateway
17. Caching: where (client/CDN/app/DB), strategies (cache-aside, write-through, write-back, write-around), eviction (LRU/LFU), TTL, invalidation, cache stampede
18. CDN
19. SQL in depth: indexes, transactions, ACID, isolation levels
20. NoSQL families: key-value, document, wide-column, graph, and when to use each
21. Replication: leader-follower, multi-leader, leaderless
22. Partitioning/sharding: range, hash, directory; hot keys; resharding
23. Consistent hashing
24. CAP theorem and PACELC
25. Consistency models: strong, eventual, read-your-writes, causal
26. Message queues and pub/sub (SQS/RabbitMQ vs Kafka), delivery guarantees
27. Streams: Kafka partitions, consumer groups, offsets
28. API design: REST vs gRPC vs GraphQL, pagination, versioning, idempotency keys
29. Real-time: polling, long polling, SSE, WebSockets
30. Rate limiting algorithms
31. Object, block and file storage (S3)
32. Search and the inverted index (Elasticsearch)
33. Unique ID generation: UUID, Snowflake, ticket servers
34. Back-of-envelope estimation: the full method

### Phase 2: Distributed systems and reliability (21)
35. Why distributed systems fail: partitions, partial failure, the 8 fallacies
36. Timeouts, retries, exponential backoff with jitter, idempotency
37. Circuit breaker, bulkhead, load shedding, graceful degradation
38. Quorums (N, R, W), sloppy quorum, hinted handoff
39. Leader election and consensus (Raft), ZooKeeper/etcd
40. Time and ordering: Lamport clocks, vector clocks, LWW, CRDTs (intro)
41. Gossip, heartbeats, failure detection
42. Distributed transactions: 2PC, Saga, the outbox pattern
43. Exactly-once processing and deduplication
44. Event-driven architecture, event sourcing, CQRS
45. Monolith vs microservices, service discovery, service mesh (light)
46. Storage engines: B-tree vs LSM tree, WAL, SSTables, compaction
47. Probabilistic structures: Bloom filter, HyperLogLog, count-min sketch
48. Geospatial indexing: geohash, quadtree, S2, **H3 (built by Uber)**
49. OLTP vs OLAP, batch (MapReduce/Spark) vs stream (Flink), lambda/kappa
50. Observability: logs, metrics, traces, alerting
51. Security: authN/authZ, sessions vs JWT, OAuth2/OIDC, encryption, DDoS basics
52. Deployment: containers, Kubernetes basics, autoscaling, blue-green/canary, feature flags
53. Multi-region and disaster recovery: active-active, RPO/RTO, failover
54. Distributed locks, leases, fencing tokens
55. Hot keys, thundering herd, the celebrity problem, fan-out on write vs read

### Phase 3: The interview method (5)
56. The framework: requirements → estimation → API → data model → high-level design → deep dives → wrap-up
57. Functional vs non-functional requirements, and asking the right questions
58. Choosing storage and modeling data
59. Driving the conversation and stating trade-offs
60. How you're scored (signals per level), and common mistakes

### Phase 4: Classic designs (24, easiest first)
- **Easy:** URL shortener, Pastebin, Rate limiter, Unique ID generator, Key-value store, Distributed cache
- **Medium:** Notification system, News feed, Chat (WhatsApp), Typeahead, Web crawler, Instagram, Leaderboard, Proximity service (Yelp), Google Drive/Dropbox, YouTube/Netflix, Ticket booking (BookMyShow), Hotel reservation, Metrics monitoring, Ad click aggregator
- **Hard:** Distributed message queue, Payment system, Stock exchange, Google Maps

Each design follows the interview framework as a guided walkthrough, then has its own question set, a reference architecture you uncover one layer at a time, and a mock-interview version.

### Phase 5: Company tracks (12)
- **Uber:** ride-hailing end to end (driver location ingestion → H3 geo-index → dispatch/matching → trip state machine → ETA → surge pricing → payments), real-time location tracking at scale, Uber Eats delivery, and Uber's real infrastructure choices (Ringpop, Schemaless, Cadence) from their engineering blog.
- **Amazon:** e-commerce end to end (catalog, search, cart, checkout/order pipeline, inventory under flash sales with no overselling, recommendations, order tracking), plus the Dynamo paper, S3 and SQS designs, the AWS Builders' Library reliability patterns, and a short guide to using Leadership Principles inside a design discussion.

### Phase 6: Low-level design / machine coding (15)
Uber runs a machine-coding round, and Amazon SDE-2 includes LLD.
- **Basics:** OOP, SOLID, UML class diagrams, concurrency in LLD
- **Patterns:** Strategy, Observer, Factory, Singleton, Builder, Decorator, State, Command, Adapter
- **Problems:** Parking lot, Elevator, Splitwise, LRU cache, Rate limiter, Vending machine, BookMyShow, Snake & Ladder, Logger, Pub-sub, Library system, Amazon Locker, Uber rider/driver matching, Tic-tac-toe, Cab booking

---

## 4. App features

| Feature | What it does |
|---|---|
| **Roadmap map** | Skill tree of every concept and design, colored by state (locked / learning / practiced / mastered). Prerequisite lines are drawn between nodes. |
| **Concept pages** | The 5-step loop from section 2 |
| **Simulators** | 24 interactive labs (section 5) |
| **Practice engine** | 9 question types (section 6), mixed and shuffled, with an explanation for every answer |
| **Daily review** | FSRS queue, about 15 minutes a day. The review count shows on the home screen. |
| **Mistakes notebook** | Every wrong answer, grouped by concept, with one-click re-practice |
| **Weak-topic finder** | Ranks concepts by recent error rate and suggests what to redo |
| **Architecture canvas** | Drag components (LB, cache, DB, queue, CDN, service…) and connect them. The app checks your design against a rubric, for example "writes go through a queue", "a cache sits in front of a read-heavy DB", "no single point of failure". |
| **Mock interview mode** | Pick a design, start a 45-minute timer split into stages, write notes and draw on the canvas. At the end the reference design is revealed layer by layer, you self-score against a rubric, and attempts are kept in history. |
| **Glossary** | About 300 terms; powers the hover definitions and drawers |
| **Search** | Ctrl+K command palette across concepts, terms and questions |
| **Dashboard** | Progress per phase, streak, hours, review due, mastery |
| **Keyboard-first** | 1–4 to answer, Enter to submit/next, Space to flip a card, J/K to move, Ctrl+K to search |
| **Backup** | Export/import all progress as one JSON file. Browser storage can be wiped, so this matters. |
| **Report a problem** | A button on every lesson and question saves your note into the export file, so content can be fixed later |

---

## 5. Simulators (24)

| # | Simulator | What you do | Phase |
|---|---|---|---|
| 1 | Request journey | Step through DNS → TCP handshake → TLS → HTTP and watch timing add up | 0 |
| 2 | Latency ladder | L1 cache to a cross-continent round trip, rescaled to human time | 0 |
| 3 | Estimation calculator | DAU → QPS → storage → bandwidth with sliders; shows every step of the math | 0–1 |
| 4 | Scaling playground | Start with one server, then add an LB, replicas and a cache; watch p99 latency and errors under a traffic slider | 1 |
| 5 | Load balancer | Round robin / least connections / weighted / IP hash; kill a server, watch health checks | 1 |
| 6 | Cache lab | Cache-aside vs write-through vs write-back, LRU vs LFU, TTL, trigger a stampede | 1 |
| 7 | Consistent hashing ring | Add/remove nodes, virtual nodes, % of keys moved vs modulo hashing | 1 |
| 8 | Sharding | Range vs hash, create a hot shard, reshard | 1 |
| 9 | Replication lag | Leader/follower, async lag, break read-your-writes, fail over | 1 |
| 10 | CAP partition | Cut the network between nodes, choose CP or AP, see what clients get | 1 |
| 11 | Kafka / queues | Producers, partitions, consumer groups, offsets; crash a consumer and watch redelivery | 1 |
| 12 | Rate limiter | Token bucket / leaky bucket / fixed window / sliding window; fire bursts | 1 |
| 13 | Real-time transports | Polling vs long polling vs SSE vs WebSocket timelines and request counts | 1 |
| 14 | Indexing | Full scan vs B-tree lookup; build an inverted index | 1 |
| 15 | Retry storm & circuit breaker | Slow the downstream, watch retries amplify, add backoff+jitter, trip the breaker | 2 |
| 16 | Quorum | N/R/W sliders and when a stale read becomes possible | 2 |
| 17 | Raft | Leader election and log replication; kill the leader, partition the cluster | 2 |
| 18 | Conflicts | Concurrent writes on two replicas: LWW vs vector clocks | 2 |
| 19 | Saga vs 2PC | An order flow where one step fails; see compensations | 2 |
| 20 | LSM tree | Memtable → SSTable flush → compaction; read path with a Bloom filter | 2 |
| 21 | Bloom filter | Insert/query; false-positive rate vs size and hash count | 2 |
| 22 | Geo index | Map grid with geohash cells / quadtree splits / H3 hexagons; find nearby drivers | 2, Uber |
| 23 | Feed fan-out | Push vs pull vs hybrid, with a celebrity user | 2, 4 |
| 24 | Distributed lock | Lease expiry, a GC pause, fencing tokens | 2 |

---

## 6. Question types (9)

1. **Single choice:** each option has its own explanation, not just the right one
2. **Multi-select:** "which of these break if the cache goes down?"
3. **Order the steps:** drag to sort (e.g. the DNS resolution path)
4. **Numeric estimate:** accepted within a tolerance band (e.g. peak QPS for 100M DAU)
5. **Match pairs:** component ↔ use case, problem ↔ fix
6. **Spot the fault:** a diagram with a flaw; click the component that fails
7. **Simulator task:** "configure the limiter so at most 100 req/min pass with bursts of 20"; passes when the simulation meets the target
8. **Architecture build:** canvas plus an automatic rubric check
9. **Written answer:** you write, then compare with a model answer and self-grade against a rubric

---

## 7. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite + React 19 + TypeScript (strict)** | Fast dev loop, no server needed |
| Styling | **Tailwind CSS v4** | Design tokens, dark/light |
| Routing | **React Router** | Concept/design/review pages |
| State | **Zustand** (UI) + **Dexie / IndexedDB** (progress) | Progress survives reloads; no backend |
| Animation | **Motion** (formerly Framer Motion) | Simulator animation and scroll-linked lesson steps |
| Diagrams | **React Flow (@xyflow/react)** | Architecture canvas and node-based simulators |
| Lessons | **MDX** | Prose with live simulators and quizzes embedded inline |
| Content checks | **Zod** + a validation script | Every prerequisite, term and question reference must exist |
| Memory | **ts-fsrs** | FSRS spaced-repetition scheduling |
| Search | **MiniSearch** | Instant local search |
| Tests | **Vitest** (engines, grading, scheduler) + **Playwright** (full concept loop) | Proof it works, not "should work" |
| Offline | **vite-plugin-pwa** (milestone 8) | Installable, works without internet |

**Not Next.js:** there's no server, no SEO need and one user. A Vite single-page app is simpler and opens offline.
**No backend in v1:** IndexedDB plus JSON export covers one learner. If you later want progress synced between laptop and phone, Supabase sync can be added in milestone 8.
Exact package versions get pinned when the project is scaffolded.

---

## 8. Data model (content lives as files, so it's versionable)

```
Concept    { id, title, phase, prerequisites[], tags, oneLiner, estMinutes, difficulty }
           + learn.mdx, theory.mdx, questions.ts, cards.ts, sources[]
Question   { id, conceptIds[], type, prompt, options/answer/tolerance, explanation, difficulty }
Card       { id, conceptId, front, back }
Design     { id, title, tier, companies[], requirements, estimation, api, dataModel,
             layers[] (reference architecture revealed in steps), deepDives[], rubric[], questions }
Term       { id, label, aliases[], oneLiner, conceptId? }
Progress   { conceptId, step, checksPassed, practiceBest, mastered }   (IndexedDB)
ReviewCard { cardId, fsrsState, due }                                  (IndexedDB)
Attempt    { questionId, correct, answer, at }                         (IndexedDB)
```

---

## 9. Folder layout

Everything stays inside this folder:

```
study plan/
  PLAN.md                  ← this file
  README.md                how to run, how to back up progress
  app/
    src/
      app/                 routes, layout, theme
      features/            roadmap, lesson, practice, review, interview, canvas, search, dashboard
      simulators/          one folder per simulator
      engine/              prerequisite graph, grading, FSRS wrapper, rubric checker
      content/
        concepts/<id>/           learn.mdx, theory.mdx, questions.ts, cards.ts
        designs/<id>/            (M5)
        lld/<id>/                (M7)
        roadmap.ts, glossary.ts
        validate.ts              content checks, run by `npm run validate`
    tools/install-deps.ps1       installs dependencies outside OneDrive
    tests/                       unit tests + tests/e2e (Playwright)
  Start Study App.cmd      double-click to launch
```

---

## 10. What to borrow from your clone projects

The clone projects in `C:\PROJECTS\clone projects` were reviewed. What's worth taking:

- **learntyping (Monkeytype):** keyboard-first flow, a minimal focus mode while answering, instant feedback, and a stats page. This is the right model for practice and review screens.
- **theme1 / theme2 / theme4 / usavionix (scroll-driven sites):** scrollytelling. In theory sections, a diagram stays pinned while you scroll through the explanation, and each paragraph changes the diagram (adds a cache, cuts a link, moves a request). Plus smooth page transitions.
- **Skip: WebGL/3D (igloo, usavionix):** heavy on the GPU and adds nothing to learning.

These mirrors are other people's sites, kept for personal study. The patterns are re-implemented from scratch; no code or assets are copied.

---

## 11. Build milestones

Each milestone ends with something you can use. Nothing moves to the next one until the current one passes its checks.

| # | Milestone | Done when |
|---|---|---|
| **M0 ✓** | **Foundation + one full slice.** Scaffold, design system, routing, content schemas + validator, IndexedDB progress + export/import, FSRS engine, question engine (first 6 types), glossary drawers + prerequisite gate, roadmap map. Two complete concepts: **DNS** and **Caching** (with the Cache lab). | You run it, do Caching start to finish, cards show up in tomorrow's review, progress survives a reload, validator and tests pass. **You review it, and we adjust before writing more content.** |
| M1 | Phase 0 content (12) + simulators 1–3 | All Phase 0 concepts complete with questions |
| M2 | Phase 1 content (22) + simulators 4–14 | Same |
| M3 | Phase 2 content (21) + simulators 15–24 | Same |
| M4 | Phase 3 + architecture canvas + rubric checker + mock interview mode + last 3 question types | One full mock interview runs end to end |
| M5 | Phase 4 designs, in batches: 6 easy → 14 medium → 4 hard | Each design has a walkthrough, questions and a mock version |
| M6 | Uber and Amazon tracks | Same |
| M7 | LLD track | Same |
| M8 | Polish: offline PWA, mobile layout, performance, optional sync/deploy | Lighthouse and Playwright pass |

You don't wait for the whole app. Start Phase 0 as soon as M1 lands, and later phases are built while you study the earlier ones.

---

## 12. Your study schedule

Assumes your job leaves about **1.5 h on weekdays and 3 h on Saturday and Sunday** (about 13.5 h/week). Change this if it's wrong.

| Weeks | Focus |
|---|---|
| 1–2 | Phase 0: foundations |
| 3–6 | Phase 1: building blocks |
| 7–10 | Phase 2: distributed systems |
| 11 | Phase 3 (method) + first 3 easy designs |
| 12–17 | Phase 4: about 4 designs a week, one mock interview each weekend |
| 18–20 | Uber + Amazon tracks, 2 mocks a week |
| 11–24 (weekends, in parallel) | Phase 6: LLD |
| Every day | 15 minutes of review queue first, before anything new |

About **6 months** to interview-ready for HLD + LLD. Faster is possible with more hours, but memory needs the spaced repetition to space out.

---

## 13. Sources the content is built from

Lessons are original writing, not copies. Each lesson lists these where they apply, so you can verify and read deeper:

- *Designing Data-Intensive Applications*, Martin Kleppmann (the most important book here)
- *System Design Interview* Vol. 1 & 2, Alex Xu
- Papers: Amazon Dynamo, Google GFS / Bigtable / MapReduce / Spanner, Kafka, Raft
- AWS Builders' Library (Amazon's own articles on timeouts, retries, backoff, shuffle sharding)
- Uber Engineering blog (H3, Ringpop, Schemaless, Cadence, dispatch)
- "Latency numbers every programmer should know" (Jeff Dean / Peter Norvig)

---

## 14. Risks and limits

- **Content accuracy:** all lesson content is written fresh for this app. Citations on every lesson and the Report-a-problem button are how errors get caught and fixed.
- **Size:** about 110 units and 1,500 questions takes many sessions. The milestone gates keep the app usable at every stage instead of half-built.
- **Written answers aren't auto-graded.** Grading free text needs an AI model, so v1 uses model answers plus rubric self-grading. AI grading can be added later; it costs API usage.
- **OneDrive:** this folder is on your OneDrive-synced Desktop. `node_modules` (about 30k files) would upload to the cloud, slow installs down and eat into your storage quota. See decision 1.
- **Browser storage can be cleared:** export a backup weekly. The dashboard will remind you.

---

## 15. Decisions (settled 2026-10-10)

1. **OneDrive and node_modules:** dependencies install into `C:\Users\ankit\.cache\study-plan-deps`, and `app\node_modules` is a junction to it. npm deletes a junction it finds at `node_modules`, so installs always go through `app/tools/install-deps.ps1`, which runs npm in the cache folder.
2. **LLD language:** Java, the default from the plan, unless you say otherwise before M7.
3. **Study time:** 1.5 h on weekdays and 3 h on weekend days, as assumed in section 12.
4. **M0:** built. Review it, then say go for M1.
