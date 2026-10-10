# System Design Study Plan

A study app that takes you from zero to Uber/Amazon-level system design interviews. Every concept follows the same loop:

**prerequisites → learn (with a simulator) → theory → practice → spaced review**

The full roadmap and the reasoning behind it are in [PLAN.md](PLAN.md).

## Start it

Double-click **`Start Study App.cmd`**. It opens http://localhost:5180 in your browser. Keep the black window open while you study and close it when you're done.

The first run installs dependencies, which takes about a minute. After that it starts in a couple of seconds.

## Your progress

- Progress is saved **in your browser** (IndexedDB) for `http://localhost:5180`. Use the same browser every time. A different browser, a private window, or a different port will look empty.
- **Back up weekly:** open *Backup* in the app and click *Export progress*. Keep the `.json` file somewhere safe, such as this OneDrive folder. *Import progress* restores it.
- Spot something wrong in a lesson or answer? Click *Report a problem* under it. Your notes are saved into the backup file, so they can be fixed later.

## What's built so far (milestone M0)

| Part | State |
| --- | --- |
| Roadmap of 60 concepts, each with a 2-minute primer | done |
| Full lessons | **DNS** and **Caching** |
| Simulators | DNS lookup, Cache Lab, hit-ratio calculator, cache stampede, write strategies (scroll-driven diagram) |
| Question types | single choice, multi-select, ordering, numeric estimate, matching, spot the fault |
| Daily review (FSRS spaced repetition), mistakes notebook, search (Ctrl+K), term drawer, backup | done |

Next is M1, the rest of Phase 0 (foundations). See PLAN.md, section 11.

## Keyboard

| Where | Keys |
| --- | --- |
| Anywhere | `Ctrl+K` search · `Esc` closes the term drawer |
| Practice | `1`–`9` choose an option · `Enter` check, then continue |
| Review | `Space` show the answer · `1` Again · `2` Hard · `3` Good · `4` Easy |

## For development

Commands run from the `app` folder:

```bash
node node_modules/vite/bin/vite.js
```

```bash
npm test
```

```bash
npm run e2e
```

- `npm test`: unit tests for the grading, review scheduler, progress rules, simulators and content validation.
- `npm run validate`: content checks only (ids, prerequisites, question shapes, every written lesson complete).
- `npm run e2e`: Playwright drives a full concept in Edge on port 5181 in a fresh profile, so it never touches your real progress.
- `npm run build`: type-check and production build.

### Why `node_modules` lives outside OneDrive

This folder is on your OneDrive-synced Desktop, and dependencies are around 30,000 files. They're installed in `C:\Users\ankit\.cache\study-plan-deps`, and `app\node_modules` is a junction (a folder shortcut) pointing there. Plain `npm install` inside `app` would delete that junction, so add or reinstall packages with the script instead:

```bash
powershell -File tools/install-deps.ps1
```

```bash
powershell -File tools/install-deps.ps1 -Add some-package
```

### Adding a lesson

1. Create `app/src/content/concepts/<concept-id>/` with `learn.mdx`, `theory.mdx`, `questions.ts` (exactly 3 with `check: true`, 10+ others) and `cards.ts` (6+).
2. Set `ready: true` for that concept in `app/src/content/roadmap.ts`.
3. Run `npm run validate`. Glossary terms inside lessons are linked automatically.

### Layout

```
study plan/
  PLAN.md                  the roadmap and build plan
  Start Study App.cmd      double-click to study
  app/
    src/content/           roadmap, glossary, lessons, questions, cards
    src/engine/            storage, grading, spaced repetition, progress rules, backup
    src/simulators/        DNS and cache simulators (pure models + UI)
    src/features/          pages: today, roadmap, concept steps, review, mistakes, backup
    src/components/        stations, term drawer, search, diagrams, scrollytelling
    tests/                 unit tests; tests/e2e has the Playwright run
    tools/install-deps.ps1 installs dependencies outside OneDrive
```
