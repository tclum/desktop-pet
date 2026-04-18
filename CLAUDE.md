# CLAUDE.md

This file gives Claude Code (and other AI assistants) the operational context needed to work on this project effectively. For the full design philosophy, story, and product vision, see `desktop-pet-design.md`. **Read that file before making any non-trivial design decision.**

---

## Project Summary

A cross-platform desktop pet for Mac and Windows. The user grows a pet from a starter form through evolution stages by being present and being productive. The pet loves them unconditionally; growth is earned through productivity but affection is never conditional on it.

**Build strategy:** Radically scoped v1. Two personalities (cuddly + powerful), two evolution stages (1st + 2nd), no legacy stage yet. See `desktop-pet-design.md` § Build Order Recommendations for full v1 scope and version roadmap.

---

## Tech Stack

- **Tauri** (Rust backend + web frontend) — cross-platform desktop framework
- **Frontend:** React + TypeScript (Vite for dev tooling)
- **Persistence:** SQLite via `rusqlite` or `tauri-plugin-sql`
- **State management:** Zustand or React Context (keep it simple — this is not a complex SPA)
- **Animation:** CSS animations + canvas/SVG for pet rendering. No heavyweight animation libraries.
- **Icons / UI:** Lucide React for utility icons; custom SVG for pet art
- **Notifications:** Tauri's notification API (native OS notifications)
- **System tray:** Tauri's tray API
- **Build / CI:** GitHub Actions for cross-platform builds

**Do not introduce:**
- Electron (use Tauri)
- Heavy state management libraries (Redux, MobX) — overkill for this app
- Backend services or cloud sync in v1 — local-only
- Browser storage APIs (localStorage/sessionStorage) — use SQLite

---

## Architecture Principles

These are non-negotiable. If a proposed change violates one of these, push back.

### 1. Event-driven, never polling
- The pet's state is computed on demand from timestamps, not maintained by a running loop
- When user takes an action, schedule the next OS-level notification for when the next meaningful event will fire
- Between events, the app does effectively nothing — no tick loops, no setInterval polling state
- On app open: read timestamps, compute current state, render
- On wake from sleep: same approach — recompute from timestamps, never trust that timers fired correctly

### 2. State is sacred
- All saves use atomic SQLite transactions
- Maintain a rolling backup (`pet.db.backup`, refreshed when current is >24h old)
- On startup: try main DB; if corrupted, restore from backup
- Schema versioning from day one — never break existing saves

### 3. Performance discipline
- Animations only run when window is visible
- When pet is hidden behind other windows, pause render loop
- Default idle animation: low FPS (4–8)
- No background CPU work when nothing is happening
- Goal: app is "always there" but doing nothing 99% of the time

### 4. Cross-platform from day one
- Build a thin platform abstraction layer for things that differ between Mac and Windows (tray icons, notifications, app data paths, sleep/wake events)
- Test both platforms regularly — don't let one fall behind
- File paths: use Tauri's `path` API, never hardcode

### 5. Privacy and ownership
- All user data is local. No telemetry without explicit opt-in.
- If telemetry is ever added, it must be anonymous, minimal, and disable-able.
- User data is the user's. Make export easy from the start.

---

## File Organization

```
src-tauri/           # Rust backend
  src/
    main.rs          # Entry point, window/tray setup
    db/              # SQLite schema, migrations, queries
    pet/             # Pet state computation, evolution logic
    notifications/   # Notification scheduling abstraction
    platform/        # Platform-specific code (mac.rs, windows.rs)
src/                 # Frontend (React)
  components/        # UI components
  pet/               # Pet rendering, animations
  productivity/      # Todo list, focus timer
  state/             # Zustand stores
  lib/               # Utilities
  styles/            # Global CSS
public/              # Static assets (placeholder pet art during dev)
```

---

## Coding Conventions

- **TypeScript strict mode on.** No `any` without a comment explaining why.
- **Rust: standard `cargo fmt` + `clippy`.** Address warnings, don't suppress.
- **Function and component names: descriptive over short.** `computeCurrentHunger()` not `getHunger()`.
- **Comments explain *why*, not *what*.** The code shows what; the comment should justify a non-obvious choice.
- **No commented-out code.** Delete it. Git remembers.
- **Test the load-bearing logic.** State computation, evolution gating, signal scoring — these need unit tests. UI components don't need tests in v1 unless they're complex.

---

## What This App Is *Not*

These are easy mistakes to make. Don't make them.

- **Not a Tamagotchi clone.** The pet does not die. There is no permadeath. There is no harsh decay. See design doc for failure mode philosophy.
- **Not a productivity surveillance tool.** Productivity drives growth, not survival. The pet loves the user regardless of performance.
- **Not an engagement-maximizing app.** No streaks that punish breaks. No FOMO mechanics. No daily login bonuses. No notifications designed to create guilt.
- **Not an enterprise product.** No manager dashboards. No team analytics. No employee monitoring. This was considered and explicitly rejected. Do not propose it.
- **Not a wellness/therapy app.** It's a companion. Don't make medical or psychological claims. Don't add mental health features without serious thought.
- **Not a freemium grind.** The core experience is never gated by payment. Optional cosmetics or supporter tiers are fine; love is not.

---

## Open Design Questions

These are unresolved and need design before the relevant build phase:

1. **The first 5 minutes (onboarding).** Needed before Phase G.
2. **The point/resource economy.** Needed before Phase D — *this is the next thing to design.*
3. **The "wants" system.** Needed before Phase F.
4. **The reflective prompt design.** Deferred to v1.3.

Do not improvise these on the fly. If a decision touches one of these, surface the question rather than guessing.

---

## Reminders for Claude Code

- **Before suggesting a feature, check `desktop-pet-design.md` § Non-Negotiables.** If it would violate a non-negotiable, don't suggest it.
- **Before building animation work, check the v1 scope.** v1 ships with two personalities and two stages — not three personalities, not four stages.
- **The art is placeholder.** Production art comes from the founder's artist friends pre-launch. Don't optimize the art pipeline beyond "good enough for development."
- **The pet must always be welcoming.** Notification copy, error states, empty states — all should err warm. Never punishing, never shaming.
- **When in doubt, ask the user (the founder).** This project has a strong design vision; don't paper over uncertainty with reasonable-sounding defaults that violate it.

---

## Build Phase Tracker

Update this as phases complete.

- [x] Phase A: Skeleton (Tauri setup, tray icon, SQLite, CI/CD)
  - *Follow-up:* Replace placeholder `.icns` with real icon once Runway-generated starter art exists. Use `npx tauri icon path/to/source.png` with a 1024×1024 source.
- [x] Phase B: A pet exists (rendering, basic interactions, state persistence)
  - *Notification permission flow is implemented but not verified end-to-end in dev — macOS restricts notification permissions for unsigned dev builds. Will verify in Phase C (when first real notification fires) or Phase H (with signed build).*
- [ ] Phase C: The pet lives (survival decay, bond, vacation detection, scheduling)
- [ ] Phase D: Productivity exists (todo list, focus timer, growth resources) — *needs point economy designed first*
- [ ] Phase E: Personality emerges (lean scoring, hatchling, first evolution ritual)
- [ ] Phase F: Stages 1 and 2 polished (both personalities, both stages) — *needs "wants" system designed first*
- [ ] Phase G: Polish, onboarding, demo flow — *needs onboarding designed first; reminder about artist friends*
- [ ] Phase H: Pre-launch (beta, code signing, distribution) — *final reminder about artist friends; verify notification permission flow with signed build*

---

*For full context, see `desktop-pet-design.md`. This file is the operational index; that one is the soul.*
