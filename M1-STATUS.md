# M1 status: Phase 0 lessons

Milestone M1 (see PLAN.md, section 11) is half done. The shared pieces and all
interactive widgets are built and compile. The eleven lessons themselves are
still to write.

## Done

- Shared UI: `components/Stepper.tsx` (guided walk-through, drives an
  `ArchDiagram` via its new `highlight` prop), `components/Segmented.tsx`,
  `components/RangeField.tsx`. `simulators/random.ts` holds the seeded random
  generator (`cacheModel` re-exports it).
- Simulator models (pure TypeScript, no tests yet) and UI, all registered in
  `features/concept/mdxComponents.tsx`:

  | Component | Model | Lesson it belongs in |
  | --- | --- | --- |
  | `RequestJourney` | `simulators/journey/journeyModel.ts` | http |
  | `LatencyLadder` | `simulators/latency/latencyModel.ts` | memory-disk-latency |
  | `EstimationCalc` | `simulators/estimation/estimationModel.ts` | estimation-basics |
  | `LossyLink` | `simulators/loss/lossModel.ts` | tcp-udp |
  | `RaceDemo` | `simulators/race/raceModel.ts` | processes-threads |
  | `RestSandbox` | `simulators/rest/restModel.ts` | api-basics |
  | `QueryPlayground` | `simulators/query/queryModel.ts` | databases-101 |
  | `HashMapLab` | `simulators/hashmap/hashModel.ts` | data-structures |
  | `PacketLab` | `simulators/packets/packetModel.ts` | internet-basics |
  | `HttpAnatomy` | none (static data) | http |
  | `Stepper` | none | what-is-system-design, client-server |

- `content/glossary-phase0.ts`: about 75 glossary terms for these lessons,
  already merged into the glossary.

## To do

1. Write the eleven lessons in `app/src/content/concepts/<id>/`, each with
   `learn.mdx`, `theory.mdx`, `questions.ts` and `cards.ts`:
   `what-is-system-design`, `client-server`, `internet-basics`, `tcp-udp`,
   `http`, `api-basics`, `processes-threads`, `memory-disk-latency`,
   `databases-101`, `data-structures`, `estimation-basics`.
   Follow the shape of `concepts/dns` and `concepts/caching`: exactly 3 quick
   checks (`check: true`), 10 or more practice questions covering several
   question types, 6 or more cards, one interactive widget in Learn, a
   Callout "interview" box, and a sources list in Theory.
2. Set `ready: true` on each of those concepts in `content/roadmap.ts` as its
   files land.
3. Unit tests for the new models in `tests/simulators.test.ts`. Expected
   values: journey with rtt 100, DNS uncached, TLS 1.3, server 20 ms is
   380 ms (TLS 1.2: 480, QUIC: 280, reused connection: 120); latency
   formatting (100 ns = "1.7 minutes", 100 µs = "1.2 days", 10 ms = "3.8
   months", 150 ms = "4.8 years"); with 0% loss TCP completes exactly one
   round trip after UDP; with 20% loss over 200 packets TCP delivers all and
   UDP loses some; with a lock, 1,000 random race runs always end at 2, and
   without one at least one ends at 1; REST: POST twice creates two orders,
   PUT twice is idempotent, DELETE then DELETE gives 204 then 404.
4. Update `tests/content.test.ts` (expected ready list), and in
   `tests/e2e/concept-loop.spec.ts` the first assertion: Today will point at
   "What system design is" once it is ready, so open `/c/dns/gate` directly.
5. Run `npm run validate`, `npm test`, `npm run build`. Then update PLAN.md
   (M1 done), README.md (what is built) and delete this file.

## Notes for working on Linux or in the cloud

- Use `npm ci` inside `app/`. `tools/install-deps.ps1` and the
  `node_modules` junction exist only because the project lives in a
  OneDrive-synced folder on Windows.
- The Playwright config uses the installed Microsoft Edge (`channel:
  'msedge'`). Elsewhere, run `npx playwright install chromium` and remove the
  `channel` line, or skip the e2e run.
- MDX gotchas: write `less than` instead of a bare `<` before a number, avoid
  `{` and `}` in prose, and keep JSX attribute strings in double quotes.
- Glossary terms are linked automatically on first mention in each lesson.
  Aliases must be unique across concepts and glossary; `npm run validate`
  reports clashes.
