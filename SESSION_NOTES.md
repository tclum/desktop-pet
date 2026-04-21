# Session Notes — April 21, 2026 (Session 3)

Autonomous session building the onboarding scaffolding. Eight commits
across the seven numbered work items plus the docs wrap-up. Everything
pushed to `origin/main`. Pre-commit hook gated every commit — cargo check
and tsc --noEmit both clean throughout.

## What shipped

### 1. Onboarding backend (commit `05a49b8`)

Schema v7→v8 adds:
- `has_completed_onboarding INTEGER NOT NULL DEFAULT 0 CHECK (0, 1)`
- `environment TEXT NULL CHECK (NULL or one of the five v1 values)`

Existing pet rows (created before migration) get
`has_completed_onboarding = 1` so upgrades don't surprise an already-bonded
user with the onboarding screen. Brand-new databases land on 0 naturally —
the `ensure_starter_pet` insert runs after migrations with the column
default.

New commands:
- `complete_onboarding(environment)` — sets both fields + writes
  `onboarding_completed` behavioral signal in one transaction. Validates
  the env enum in Rust before SQL so errors are clean.
- `debug_reset_onboarding()` — flips the flag back and clears env. Preserves
  pet identity, growth, bond, personality, stage. Purely about re-showing
  the intro screens.

`PetStateDto`, frontend `PetState`, and `tauri.ts` wrappers extended.

### 2. StartScreen (commit `83359e3`)

First-launch welcome. Pre-pet visual is a CSS-only egg with a soft radial
glow — "the creature is already there in some form" without committing to
a look before environment selection. Idle pulse at 4.2s, deliberately
slower than the main pet's 3s breath so the rhythms don't clash on hand-off.

Copy:
- Title: "Hello, you."
- Subtitle: "Someone's about to meet you."
- Primary: "Start" (autofocus)
- Secondary: "Learn more"

New `src/styles/onboarding.css` hosts the shared screen / action / button
treatment all three onboarding screens use. Screens enter with a 360ms
ease-out fade + translateY 4→0 matching the focus-done polish pattern from
session 2.

### 3. LearnMore (commit `24999ca`)

Structural FAQ placeholder. Four sections with stable `data-section`
identifiers and a `TODO(copy)` marker next to each:
- What is this?
- How does it work?
- What it's not
- Privacy

Placeholder copy errs warm and gestures at the non-negotiables so nothing
off-brand slips into an early screenshot, but the real words are held for
a dedicated copy pass. Back button autofocuses so keyboard users can
immediately return with Enter/Space.

### 4. EnvironmentSelect (commit `c36a5c5`)

Five cards in a scrollable column: Forest / Countryside / Mountain / Ocean
/ City, each with a gradient hint matching the flavor table in
§ Environments as Cosmetic Skins.

Keyboard accessibility follows the WAI-ARIA radiogroup pattern:
- `role="radiogroup"` wraps the cards; each card is `role="radio"`
- Roving tabindex — only the selected card (or first card if nothing
  selected yet) is in the Tab order
- Arrow keys (both axes), Home, End all move focus AND selection together
  the way an OS radio group would
- Continue button is disabled until a selection exists; shows
  "Settling in…" during submit

On Continue, `complete_onboarding` is called. The returned pet goes up to
the `onCompleted` callback. Errors surface as a gentle warm panel — never
alarming — with a "try again in a moment" message.

### 5. OnboardingFlow wrapper (commit `cef1303`)

Three-step state machine: `start → environment → (complete)`, with
`learn-more` as a side branch reachable from `start`. Each step change
unmounts the previous screen, so the 360ms fade-in runs fresh on every
step — that's the cross-fade between steps.

A `TODO(design)` marker at the bottom of the file calls out the
"meeting your pet" ceremonial beat that should bridge environment
selection and the main app. Held for explicit design decisions.

### 6. App.tsx wiring (commit `1807262`)

Three render states:
1. `petState === null` → existing pulsing-dot loading placeholder
2. `has_completed_onboarding === false` → `OnboardingFlow`
3. `has_completed_onboarding === true` → existing main app

No flash between states — loading placeholder persists until
`startSession` resolves and the flag is known.

`OnboardingFlow.onCompleted` is wired to `handlePetStateUpdate`, so the
pet returned by `complete_onboarding` flips the UI over with one
`setPetState`. No extra orchestration needed.

`DebugPanel` stays mounted during onboarding so the founder can hit
Cmd/Ctrl+Shift+D mid-flow during demos. The drag handle is hidden
during onboarding (window still drag-enabled via Tauri config).

New `.pet-window--onboarding` class gives the onboarding container the
same frosted-glass treatment as the productivity panel — consistent
visual language.

### 7. Debug panel reset-onboarding (commit `303de3d`)

New "reset onboarding" button. Flips the flag back, clears environment,
preserves everything else. Lets the founder iterate on onboarding
content without deleting `pet.db`.

### 8. Docs wrap-up (this commit)

CLAUDE.md updated: schema v8, file organization shows `src/onboarding/`,
Build Phase Tracker marks Phase G as partial with explicit notes on what
the onboarding scaffolding covers and what remains.

## Notes for Taylor

### Design decisions made without asking

- **Existing pets marked onboarded on migration.** A user who already has
  a bonded pet shouldn't suddenly see the onboarding screen after a
  schema upgrade. Migration sets `has_completed_onboarding = 1` for any
  pet row predating the migration; new databases start at 0. `environment`
  stays NULL for legacy pets — downstream code tolerates NULL (cosmetic
  env flavor is strictly additive, not load-bearing).

- **Onboarding copy is warm but minimal.** Two lines on the start screen,
  four short sections in learn-more, one line per env card. I erred on
  "less is more" since the brief called out specific TODO markers for
  real copy and I didn't want my placeholders to ossify as final text.

- **Error state on env selection is inline, not a modal.** A warm-tinted
  error panel between the grid and the Continue button. User can try
  again without losing their selection. Not alarming, not blocking.

- **"reset onboarding" preserves pet state.** Brief explicitly said my
  call; I preserve. Rationale in the commit message: the founder will
  test onboarding many times against the same pet fixture, wiping
  every time would be friction. If you want a "hard reset" button too
  (wipe + reset onboarding), trivial to add — just chain
  `debug_reset_pet` + `debug_reset_onboarding`.

- **Environment cosmetics not yet wired.** The brief said "architecture
  should support it but don't build visuals." The env value is
  persisted and reaches `PetState` everywhere it's needed; the visual
  plug-in points are `PetView` (sprite tinting) and the pet area
  (ambient background). A `TODO(design)` marker in the env CSS
  section flags this for the next onboarding design pass.

### TODO markers left in the codebase (all intentional)

- `TODO(copy)` — four markers in `LearnMore.tsx`, one per section.
- `TODO(design)` — two markers:
  - Bottom of `OnboardingFlow.tsx` — the "meeting your pet" beat
    between env selection and the main app.
  - Top of the env-grid CSS block — sprite tinting / ambient
    environmental background held for design.

Grep for `TODO(copy)` and `TODO(design)` to find them all.

### What I did not touch

- Existing evolution flow (`check_and_evolve`, stage1 reveal transition)
- Pet rendering core (`PetView`)
- Productivity panel, TodoList, FocusTimer
- Window dragging (still enabled via Tauri config; handle hidden
  during onboarding only)
- Existing debug-panel buttons

### Build status at end of session

- `cargo check`: clean
- `npx tsc --noEmit`: clean
- Pre-commit hook ran on every commit and passed
- All eight commits pushed to `origin/main`

### Nothing skipped

All seven numbered work items shipped. Polish / test-coverage of the
onboarding flow against edge cases (e.g. what if user quits mid-flow
and relaunches? — they land back on the start screen since the flag is
still 0, which is probably right) wasn't called for and I didn't
add it. Happy to write tests for the flow in a follow-up if useful.
