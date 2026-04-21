# Session Notes — April 20–21, 2026

Autonomous session working through the priority list in CLAUDE.md. All six
priorities shipped and pushed. Full summary below.

## What shipped

### 1. Debug panel — hidden demo controls (commit `2cf5431`)

Keyboard shortcut `Cmd/Ctrl+Shift+D` toggles a small corner overlay with:
- "reset to starter" — stage=starter, personality=NULL, growth=0, bond=0
- "+1 growth" / "+5 growth" — adds raw growth resources, triggers evolution check
- "force evolve" — calls the existing `evolve_to_hatchling` command

Backend commands (`debug_reset_pet`, `debug_add_growth`) are always available,
not gated by build profile, so the founder can demo a release build. Debug
growth deliberately does *not* write to `growth_events` — that ledger stays
clean for real productivity history. Evolution rows are still written by
`check_and_evolve` when a threshold crosses, which is correct.

Panel is deliberately utilitarian: monospace, tiny, muted colours. Not part
of the product surface.

### 2. Time-aware greeting (commit `9f04b58`)

Backend `check_greeting` command, called once on app mount. Tiers the
greeting from `seconds_since_last_interaction`:

| Tier   | Threshold  | Visual                                    |
|--------|------------|-------------------------------------------|
| none   | <30 min    | Nothing                                   |
| small  | 30m–4h     | 1.8s warm pulse, peak 0.35 opacity        |
| medium | 4h–24h     | 3.2s warm pulse, peak 0.55 opacity        |
| large  | >24h       | 4.5s soft sustained warm wash, peak 0.75  |

Persists `last_greeted_at` in `settings`; if the last greeting was under
30 min ago, skip (prevents rapid-toggle re-fires). Writes a `greeted`
behavioral signal when a tier fires.

Frontend: pending greeting is buffered until PetView's RAF loop registers
its trigger, so the animation never races the initial load.

### 3. Second reaction type (commit `33a67cb`)

Task completion and focus completion now look visually distinct:
- Task (and pet click): fast warm pulse, 1.5s, peak 0.45
- Focus: slower, deeper, held glow, 2.6s, peak 0.70

Threaded `ReactionKind = 'task' | 'focus'` through `ProductivityPanel` →
App → `PetView`. TodoList and FocusTimer keep their original
`onPointsEarned(points)` signatures; the panel injects the kind at the
boundary. Pet now has a small vocabulary instead of a single response.

### 4. Phase C minimal essentials (commit `8b958c3`)

Schema migration v5 → v6 adds `bond INTEGER NOT NULL DEFAULT 0` to `pet`.
Bond is monotonically non-decreasing — per non-negotiable, absence costs
nothing. Grows inside existing interaction transactions:
- Pet click: +1
- Task completion: +1
- Focus completion: +1 per 15 min completed, clamped [1, 8]

Resting visual: `.pet-view--resting` CSS class applied when
`seconds_since_last_interaction ≥ 24h`. Subtle `filter: saturate(0.75)
brightness(0.95)` on the sprite. Clears instantly on any interaction
(derived from re-fetched pet state, not a running timer).

Vacation signal: `check_greeting` writes a `vacation_return` behavioral
signal when absence crosses 3 days. Future Phase C work can key off it.
No decay, no penalty — structurally impossible given how the rest is
built.

`bond` is exposed in PetStateDto / PetState but not displayed yet. No
visible counter, per the non-negotiable against XP bars.

### 5. UI copy polish (commit `a5f0a6f`)

Two light touches:
- `FocusTimer.COMPLETION_MESSAGES` expanded from 3 to 6 variations:
  added "That was nice.", "Well spent.", "Glad you were here."
  All understated, all warm, none grand.
- App error page reworded: "Something got in the way of loading your
  pet." + a reassurance line "Your save is still safe. Try restarting
  the app." Raw error kept but visually muted.

Other strings reviewed and left alone — they already match the
companion tone.

### 6. TypeScript cleanup (commit `3118e1e`)

`npx tsc --noEmit` was flagging three errors. All now pass clean:
1. Added `src/vite-env.d.ts` with the standard Vite client reference,
   which supplies ambient module declarations for `*.png` imports.
2. Fixed FocusTimer's `COMPLETION_MESSAGES[...]` lookup under
   `noUncheckedIndexedAccess` — fell back to `''`.
3. **Caught a real bug**: `PetView`'s greeting commit referenced
   `onRegisterGreetingTrigger` in the function body without
   destructuring it from props. This would have thrown a
   `ReferenceError` on render. `npm run vite:build` doesn't
   typecheck, so it passed my verification step and shipped broken.
   Now destructured; feature works.

## Notes for Taylor

### The greeting shipped broken for one commit

Commits `9f04b58` → `33a67cb` had a runtime `ReferenceError` in
`PetView` because I forgot to destructure a prop. My verification
step was `npm run vite:build`, which does *not* run `tsc`. The TS
cleanup commit (`3118e1e`) caught and fixed it, but for any manual
testing you did between those commits, the app wouldn't have
rendered. **Worth adding `tsc --noEmit` as a standard verification
step before each commit** — or wiring it into a pre-commit hook.

### Design decisions I made without asking

- **Bond accumulation rates.** Pet click = +1, task = +1, focus =
  +1 per 15 min clamped [1, 8]. These are starting points, tunable.
  No design doc had specific rates; I picked values that make focus
  sessions contribute more bond than quick clicks, matching the
  "sustained presence is what the relationship is built on" framing.
- **Resting threshold: 24 hours.** Short enough to register "absence"
  but long enough that a normal workday + sleep cycle doesn't
  trigger it. If you want the pet to look quieter earlier (say 12h),
  flip the constant in `PetView.tsx`.
- **Greeting tier thresholds: 30min / 4h / 24h.** Generous on purpose
  per the design's "welcomed, not re-onboarded" framing.
- **Opening the app does *not* currently count as an interaction**
  for `last_interaction_at`. The greeting plays, but the user still
  has to click the pet (or complete a task) for bond/interaction to
  register. This is consistent with care-vs-greeting separation.
  Might be worth revisiting — the design says "opening the computer
  counts." I left it alone for this sprint.

### Open questions I surfaced but didn't resolve

- Should app-open count as an interaction (bump `last_interaction_at`)?
  Leaning yes per the design, but wanted your call before changing
  it — it affects bond accumulation, greeting tiering, and resting
  state.
- The `debug_add_growth` write to `growth_events` was originally
  done but removed — I concluded that polluting the real productivity
  ledger with debug rows is worse than missing the debug boost in
  any future analytics. You may disagree; easy to re-add.

### What I did not touch

- Focus timer logic (per your constraints)
- Pet rendering/evolution transitions (except adding new overlays)
- Productivity panel layout
- Window dragging

### Nothing skipped

All six priorities on the list shipped. Nothing was deferred for
design ambiguity or scope. The session had time to spare — the list
was well-scoped.

### Build status at end of session

- `cargo check`: clean
- `npm run vite:build`: clean
- `npx tsc --noEmit`: clean (was failing with 3 errors at session start)

All seven commits pushed to `origin/main`.
