# Desktop Pet — Design Document

A cross-platform desktop pet (Mac + Windows) that grows from a starter form through evolution stages, driven by the user's productivity, with an emotional architecture built on unconditional love and earned growth.

---

## Why This Exists

This product exists because I needed something like it, and it wasn't there.

I'm the youngest of five in a family of people who could have achieved more. My father is an electrical engineer who escaped communism in China. My mother is loving and cared for me as much as she could. My four siblings followed the rules to the letter. I'm the black sheep — the one who didn't fit the mold, who left home at 19, who has worked in over ten different industries and held more than thirty jobs.

I've lived through homelessness. I've lived through identity confusion. I once tried to end my life after a romantic tragedy. I came back from that, and I came back wanting to work hard and do good.

I know what it's like to need something that's glad you're still here, and to find that most of the world's tools require you to perform before they'll be kind to you. I know what it's like to be measured against rule-followers and found lacking. I know what it's like to be on the receiving end of conditional value, in family and work and love.

The pet this app builds is the thing I would have wanted in the hardest seasons. It loves you whether or not you've earned it today. It grows with you when you can grow and waits patiently when you can't. It's still there when you come back. It doesn't punish you for being human.

Every design decision in this document traces back to that. The forgiveness, the no-death commitment, the separation of love from productivity, the refusal to build engagement hooks that exploit anxiety, the choice not to sell to enterprises who would surveil their employees with it — none of these are marketing positions. They're engineering decisions made by someone who knows specifically why they have to be this way.

I'm building this because someone should, and because I have the lived knowledge of why it has to exist exactly like this. If it helps even a few people feel a little more held in their day, it will have been worth it. If it helps more than that, even better. But the product is the point, not the growth of it.

*(More stories will be added here as they come. This section is not finished — it's just enough for now.)*

---

## Non-Negotiables

These are explicit commitments. They're written down so future versions of me, and anyone who joins the team, can point to them and say "we said we wouldn't do this." When pressure comes — and it will come — these are the words to return to.

- **We will not extract from users to grow metrics.** Engagement is a side effect of being good, not a goal that justifies design decisions.
- **We will not gate the core companion experience behind payment.** Love does not have a paywall. Optional cosmetics, optional integrations, optional supporter status — fine. The pet itself, the bond, the growth, the affection — never.
- **We will not build engagement hooks that exploit anxiety, FOMO, or social comparison.** No streaks that punish breaks. No leaderboards. No notifications designed to create guilt. No mechanics that work because they hurt a little.
- **We will not sell or share user data.** Behavioral signals stay on the user's device. If we ever need cloud sync, the data is encrypted and the user owns it.
- **We will not let a funding model force us to be a different kind of product.** This means being deliberate about what funding we take, from whom, and on what terms. Better to grow slowly with the right structure than fast with the wrong one.
- **We will not build an enterprise version that lets managers surveil employees through this product.** This was considered and rejected. The pet is for the individual person. It is theirs.
- **We will not stop being able to say what this app is *for*.** When we can no longer answer "who is this serving and how" in one clear sentence, we have lost our way.

### Source of Tenacity

This product will be hard. The valley between starting and shipping will be long. The pressure to compromise will be constant — to add the engagement hook, to take the corrupting funding, to extract from users for growth, to follow the playbook everyone else is following.

The reason to keep going through that valley is the same reason this exists: the lived knowledge that products that get this wrong hurt people, and that someone has to build the version that doesn't. That someone is me, because I have the specific knowledge of why it has to be this way. The stories that brought me here — the homelessness, the thirty jobs, the night I almost didn't stay — those aren't separate from the work. They are the work's foundation.

When the work feels endless, return here. When a decision feels hard, return here. When someone offers something that would compromise the design, return here. The compass is in the story.

---

## 🎯 CORE PURPOSE

**This app exists to increase the quality of life of the people who use it.**

Quality of life is measured over time, not in moments. It is felt by the user, not measured by us. It means the app should *reduce* friction in life, not add to it. It means we underclaim and overdeliver. It means we are not curing disease, solving loneliness, or fixing the productivity crisis — we are making one small good thing that, integrated into a life, makes that life slightly nicer. That humility is the design.

Every other decision in this document is in service of this purpose. When a decision is unclear, ask: *does this serve the quality of life of the user?* If the answer is no, do not do it, regardless of what it does for engagement, growth, or revenue.

## 🛑 NON-NEGOTIABLES

These are explicit commitments. They are not aspirations. They are written here so that future versions of the team can point to them and say *we said we wouldn't do this*.

- We will not extract from users to grow metrics
- We will not gate the core companion experience behind payment
- We will not build engagement hooks that exploit anxiety, FOMO, or social comparison
- We will not use streak mechanics that punish missed days
- We will not sell or share user data
- We will not let a funding model force us to be a different kind of product
- We will not include features that make users feel worse about themselves on a bad day
- We will not optimize for time-in-app as a success metric
- We will not stop being able to clearly say what this app is *for*
- We will not let the design's emotional integrity erode through accumulated small compromises

When a decision threatens any of these, the decision is wrong. The non-negotiables win.

## ⚠️ OPEN QUESTIONS — Revisit Periodically

These design areas are still open and need decisions before or during build. Each one is foundational enough that getting it wrong will hurt the product. Revisit during build planning, before v1 launch, and whenever stuck on a related decision.

1. **The first 5 minutes** — Onboarding, the starter form, and the moment that makes someone keep the app installed. This is the highest-leverage UX in the entire product. If users don't feel a spark of connection in the first session, nothing else matters. Needs to be designed before Phase G of build.

2. **The point/resource economy on the productivity track** — What completed work actually does, how it converts to growth, what the unit of "productive activity" is, and how to balance generosity (so casual users grow) against meaning (so growth feels earned). Needs to be designed before Phase D of build.

3. **The "wants" system** — How the pet's moods and preferences surface to the user. How does a user know what their pet is in the mood for today, without it becoming a guessing game or a chore? This is where attentive users get rewarded with deeper bond. Needs to be designed before Phase F of build.

4. **The reflective prompt design** — The writing, framing, frequency, and tone of the philosophical questions that feed cosmetic biographical evolution. Hardest tonal target in the app. Needs to feel like a thoughtful friend asking, not a wellness app prompting. Deferred from v1 (lands in v1.3).

## 🎨 ARTIST FRIENDS REMINDER

Production art will be done by artist friends pre-launch. Runway ML API is for development placeholders only. **Bring up the artist friends conversation explicitly:**
- Before beta testing — first impressions shape word-of-mouth
- Before public launch — the art *is* the product for a pet app; users won't fall in love with placeholders
- When approaching Phase F of build (when personality-distinct visuals become important)

---

## Core Concept

A desktop pet that lives primarily in the menu bar (Mac) / system tray (Windows), with an optional desktop widget. The pet grows from a neutral starter form (egg/seed/etc.) through four evolution stages plus a legacy stage. Growth is driven by the user's productivity. Love and survival are driven by the user's presence. The two tracks are deliberately separated so productivity is never a condition for affection.

**Target user:** the general individual who wants to succeed — solo, personal use. Explicitly *not* enterprise. Explicitly *not* a productivity surveillance tool.

**Platforms:** Mac and Windows for v1. Phone companion possible later as a separate build with backend sync.

---

## The Two Tracks

The fundamental architectural decision: love and growth are separate currencies.

### Survival / Love Track — About Presence

The pet stays alive and loves the user because the user *exists and shows up*. Opening the computer counts. Saying hi counts. Decay is slow, forgiving, and pauses generously when the user is genuinely away.

- **Minimum to survive:** showing up roughly once every 3 days (opening the computer / interacting with the app)
- **Vacation handling:** both explicit ("I'll be away") and automatic (detecting prolonged absence) — build for the user who forgets to set vacation mode
- **Failure mode:** *not* death. The pet enters a sad/hibernating state, recovers immediately on return. Bond never decreases from absence.
- **What lives here:** hunger, happiness, cleanliness, bond/affection, greetings, reciprocal gestures

### Productivity Track — About Growth

Productivity makes the pet *develop* — evolve to new stages, unlock new capabilities, gain new appearances. Opt-in by nature: no engagement means no growth, but no suffering either.

- **Source for v1:** built-in to-do list + Pomodoro/focus timer only. Defer third-party integrations to post-launch based on actual user demand.
- **What lives here:** evolution stages, unlockable forms, accessories, environments, abilities, accumulated growth resources
- **Anti-cheat posture:** light. Cheating productivity points only cheats the user out of earned satisfaction. Don't over-engineer this.

---

## The Three Personalities

The pet's personality is one of three axes, determined through a hybrid model.

### The Three Axes

- **Cuddly and warm** — soft, affectionate, gentle reactions, loves consistent care and presence
- **Eccentric and creative** — surprising, novelty-seeking, unusual reactions, loves variety and new experiences
- **Powerful and fierce** — confident, energetic, bold reactions, loves challenge and play-fighting. *Aggressive in the world, never toward the user.* Loyal companion, fierce on user's behalf.

### Hybrid Determination Model

1. **Starter phase (~week 1):** Pet is fully neutral. No personality tracking yet. User explores and learns the app.
2. **Hatchling phase (~weeks 2–6):** Personality tracking begins. Subtle behavioral cues in idle animations show the lean. A small, optional "personality" view is *discoverable* (not pushed) for engaged users who want to see it.
3. **First evolution ritual:** When growth resources accumulate and time has passed, a special evolution moment arrives. User sees the lean, can embrace it, choose a different one, or "let the pet decide" (weighted toward leading axis with chance of second-strongest).
4. **Lock-in:** Personality is locked after first evolution. Future evolutions deepen the chosen personality, never switch axes.

### Signals That Feed the Lean

- **Care interaction patterns** — gentle/varied/energetic
- **Productivity rhythm** — steady/bursty/long-focused
- **Time-of-day patterns** — evening/late-night/morning
- **Care timing relative to need** — anticipatory/surprising/efficient

Aggregated into three normalized scores. Tunable through playtesting. No single signal dominates.

### Personality Differentiation

Each personality differs in:
- Visual design at every stage
- Idle animations
- Greeting behavior
- Care reactions
- "Want" patterns
- Environment preferences
- Notification voice/tone
- (Possibly) small productivity-related behaviors

---

## Evolution Stages

Four evolution stages plus legacy. Pacing roughly:

| Stage | When | Description |
|-------|------|-------------|
| Starter | Day 1 | Neutral, identical for all users (egg/seed/etc.) |
| Hatchling | ~Week 1 | Personality emerging, bond beginning |
| First evolution | ~Month 1–2 | Personality chosen, identity formed |
| Second evolution | ~Month 3–5 | Deepening, more capable |
| Third evolution | ~Month 7–10 | Maturity, fullness |
| Fourth evolution | ~Year 1–1.5 | Final growth form, complete |
| Legacy | ~Year 2+ | Settled, present, eternal — earned through sustained bond |

Each evolution unlocks something visible and meaningful: new behaviors, accessories, environments, abilities. Not just new sprites.

---

## The Legacy Stage

A fifth state earned through *time, presence, and bond* (not productivity). Once the pet reaches stage 4 *and* the bond meter crosses a threshold *and* a minimum time has passed (~6 months at stage 4), the legacy stage unlocks.

### Design Principles
- **Surprise, not milestone.** No progress bar to legacy. Arrives unannounced one day.
- **Settled, not flashier.** The pet looks more *complete* and at-ease, not more impressive.
- **Emotional reward only.** No mechanical advantages. Doesn't change how the app works — changes how it *feels*.
- **No stage 6.** Legacy is the destination. Adding more stages dilutes the meaning of arrival.

### What Legacy Unlocks: Ambient OS Personality

The legacy pet doesn't *do more* at the OS level. The OS *feels more like the pet's home*. Safe, no special permissions required, works the same on Mac and Windows.

- **Notifications gain the pet's voice and tone** — every notification sounds like *your specific pet* in their personality
- **Custom sounds** (optional, off by default) — themed to personality
- **Subtle desktop signature** — small temporary marks/halos themed to personality (very gentle, very ignorable)
- **Wallpaper companion** (optional) — desktop wallpaper that incorporates the legacy pet
- **Richer menu bar presence** — more expressive icon, micro-animations, contextual states
- **App theming** — UI takes on small accents matching the pet's personality

All ambient features are individually opt-out. Users choose their level of immersion.

### Explicitly Not Building (Yet)
- Pet appearing across other apps
- Pet managing notifications from other software
- Pet controlling focus modes or website access
- Pet acting as an assistant
- Anything requiring Accessibility API or similar entitlements

These can come in v2+ as opt-in expansions. Not committing to them now keeps surface area small, permissions clean, product focused.

---

## The Cosmetic / Biographical Track

A *third* parallel system alongside personality and evolution. Continuous, lifelong, additive. Reflects *who the user has been over time* through visible accumulation in the pet's appearance and environment.

### Two Sources

**Behavioral history:**
- Time-of-day patterns → ambient lighting and color of environment
- Care action frequency/type → accessory tendencies
- Productivity rhythm → environmental complexity
- Consistency over time → "rooted" environmental elements
- Special moments → small commemorative items

**Reflective prompts:** (see Open Questions — needs detailed design work)
- Rare and meaningful (every few weeks, not weekly)
- Framed as the pet asking, not the app prompting
- Low-effort to answer (thoughtful options, optional free-text)
- Effects are visible but indirect (felt, not stated)
- Tone is friend-like, never therapeutic, never trivial
- Always skippable without penalty

### Design Principles
- Every behavioral pattern maps to cosmetics that *feel like a fitting expression*, never a judgment
- No "negative-coded" cosmetic outcomes — chaotic life ≠ ugly pet
- Small layer of direct user agency (arranging earned items, color picks) is healthy
- Visual elements must blend harmoniously regardless of accumulation
- The system is invisible until users start to notice — gentle reveal moment recommended early on

---

## The Three Growth Systems Together

| System | What It Defines | How It's Earned |
|--------|----------------|-----------------|
| Personality | Who your pet *is* | Behavioral lean, locked at first evolution |
| Evolution | Who your pet *becomes* | Productivity over time |
| Cosmetic/Biographical | Who you've been *together* | Behavioral history + reflective prompts |

The user should *experience* all three without ever being taught they're separate tracks. They should feel like one rich, living thing.

---

## Pet Lifecycle Architecture

### One Pet at a Time
- Users can only start a new pet after the current pet reaches max evolution (stage 4)
- This commits to the bond philosophy — no character-swapping
- Hold the line on this even when users push back

### No Aging, No Death
- Pet does not age or die
- Bond grows forever on a long curve
- Users can stay in forever-bond with their first pet — no pressure to start a second

### After Max Evolution / Legacy
- Pet stays fully present and accessible
- User explicitly chooses if/when to start a new pet
- Original pet remains permanent furniture in the app:
  - Always-accessible legacy view
  - Occasional cameos during interactions with new pet
  - Possible mentor role / intergenerational bond
- Combination of these is right; legacy pet should never be "out of sight"

---

## Notification Design Philosophy

Notifications are load-bearing. They're how the pet stays present without being intrusive. Get them wrong and users mute the app, breaking the entire engagement loop.

### Principles
- **Variation** — never the same notification text twice in a row
- **Context-awareness** — reference time elapsed, time of day, current pet state
- **Timing tied to meaningful moments** — not fixed clock times
- **Restraint** — once a day greeting, not multiple
- **Celebrate completions over prompting actions** — "Your pet evolved!" beats "Time to do work!"
- **The notification is a promise; the moment after the click must keep it** — opening the app should reveal a small charming moment, not a list of stats

### Channels
- Survival/love notifications — warm, low-frequency, presence-focused
- Achievement notifications — exciting, milestone-based, celebratory
- These should feel different in tone and not compete for slots

### Notifications Denied
A meaningful percentage of users will deny notification permissions. Need fallbacks:
- Icon visually changes state (hungry pet vs. happy pet visible in menu bar)
- Badge counts where supported
- First-run experience that explains *why* notifications matter before asking

---

## Technical Architecture

### Stack
**Tauri (Rust + web frontend)** — cross-platform, lightweight (5–15MB vs Electron's 100+MB), native menu bar / system tray / notifications, transparent always-on-top windows, ships .dmg for Mac and .msi/.exe for Windows from one codebase.

### Event-Driven Scheduling (No Polling)
- When user takes an action, calculate when the *next meaningful event* will happen
- Schedule OS-level notification/timer for that exact time
- Between events, app does effectively nothing
- Pet state computed on demand from timestamps when user opens the window
- Animation cost paid only when pet is visible
- On wake from sleep, recompute state from timestamps rather than trusting timers fired correctly

### State Persistence
- **Save data is sacred** — users get attached fast
- Atomic writes (write to temp file, then rename)
- Automatic backups
- Versioned save format from day one
- Local-first; backend only needed if/when adding phone companion

### Platform-Specific Considerations
- **Mac:** Menu bar icon, set window collection behaviors so pet follows across Spaces and floats over fullscreen apps. Apple Developer account ($99/yr) required for code signing.
- **Windows:** System tray icon (collapsed under `^` chevron by default — discoverability problem). Code signing certificate ($200–500/yr) to avoid SmartScreen warnings.
- **Both:** Notification permission flows differ; both can be globally muted by user with no error to the app.

### Performance Discipline
- Tick infrequently (every 30s+ when idle, not every second)
- Compute, don't simulate (timestamp-based state, not running counters)
- Pause animations when window not visible
- Coalesce work into single timers
- Use OS-level scheduling for long-term events
- Goal: app is "always there" to user but doing nothing 99% of the time

---

## Build Order Recommendations

### Build Strategy: Radically Scoped Productivity Pet (Version C)

The chosen approach: ship the *complete pitch* in scoped form rather than a polished leisure pet first. The productivity angle is the differentiator and must be in v1, but the surface area can be compressed dramatically without losing the emotional arc.

Total estimate: **3–4 months full-time, 5–7 months part-time** for v1.

### Art Pipeline
- **Development:** Runway ML API for placeholder art and reference generation
- **Pre-launch:** Artist friends step in for the actual production art — pet designs, evolution stages, animations, personality variations
- **⚠️ REMINDER:** Bring up the artist friends conversation explicitly before beta testing (first impressions shape word-of-mouth) and again before public launch (the art *is* the product for a pet app — users won't fall in love with placeholders)
- **Note on Runway limitations:** Runway is great for individual images and reference art, but won't produce consistent character animation across many frames and states. Plan to use it for reference and placeholder, not final pipeline.

### v1 Scope (Ship First)

**Keep:**
- Mac + Windows
- Single pet
- Full survival/love track with 3-day forgiving decay
- Built-in to-do list and focus timer
- Productivity → growth resources → evolution gating
- Hybrid personality determination (tracking + first-evolution ritual)
- **Two personalities only:** cuddly and powerful (highest contrast for clearer differentiation; eccentric added in v1.1)
- **Stages starter → hatchling → 1st evolution → 2nd evolution only** (stages 3, 4, legacy deferred)
- Basic notification system with variation
- Behavioral signals tracked from day one (so data accumulates for future cosmetic features)
- Menu bar / system tray presence
- Notification-denied fallbacks

**Cut from v1, add in version sequence below:**
- Third personality (eccentric)
- Stages 3 and 4
- Legacy stage and all ambient OS features
- Cosmetic biographical track
- Reflective prompts
- Optional desktop widget
- Custom sounds, desktop signatures, wallpaper companion

### Version Roadmap

| Version | Adds |
|---------|------|
| v1.0 | Core scoped product — full pitch in working form |
| v1.1 | Third personality (eccentric), optional desktop widget, ambient theming foundations |
| v1.2 | Stages 3 and 4 (full evolution arc) |
| v1.3 | Cosmetic biographical track + reflective prompts |
| v1.4 | Legacy stage and full ambient OS features |
| v2.0 | Phone companion (requires backend/accounts/sync) |
| v2.x+ | Third-party productivity integrations, calendar integration, OS-level capabilities |

### v1 User Arc

Install → onboard → meet starter pet → start using to-do list and focus timer → over 2–4 weeks, hatchling phase shows personality emerging → first evolution ritual → personality-distinct young pet → continue care and productivity → second evolution → mature pet (within v1's stage cap) the user is bonded with.

### v1 Investor Demo Arc (5 minutes)

Onboarding magic → daily interaction → productivity feeding pet growth → personality emergence → first evolution ritual → bonded relationship. The complete vision in a working product, with the roadmap clearly laid out for what's coming.

### Build Phases

**Phase A: Skeleton (week 1–2)** — Tauri setup, menu bar/tray icon, empty pet window, SQLite, CI/CD

**Phase B: A pet exists (week 3–4)** — Pet rendering, basic interactions, state persistence, notification permissions

**Phase C: The pet lives (week 5–7)** — Survival decay, sad/hibernating state, bond meter, vacation detection, greeting notifications, scheduling

**Phase D: Productivity exists (week 8–9)** — To-do list, focus timer, growth resources, signal tracking
- ⚠️ The point/resource economy must be designed in detail before this phase

**Phase E: Personality emerges (week 10–12)** — Lean scoring, hatchling visualization, optional personality view, first evolution ritual, lock-in, two personality paths

**Phase F: Stages 1 and 2 polished (week 13–14)** — Both personalities for both stages with distinct visuals, behaviors, care reactions
- ⚠️ The "wants" system needs to be designed before this phase

**Phase G: Polish, onboarding, demo flow (week 15–16)** — First-run onboarding, settings, vacation mode UI, error handling, investor demo path
- ⚠️ The first 5 minutes / onboarding must be designed before this phase
- ⚠️ Reminder to talk to artist friends before beta

**Phase H: Pre-launch (week 17+)** — Beta testing, bug fixes, code signing/notarization, distribution, launch prep
- ⚠️ Final reminder on artist friends — production art needed before public launch

### Definition of Done for v1
A user can install on Mac or Windows, go through onboarding, raise a pet through the first two evolution stages over 1–2 months, experience both personality paths (across multiple playthroughs), feel the emotional arc of the design, and want to keep the app installed.

---

## Design Philosophy Summary

The non-negotiables that everything else serves:

1. **Quality of life is the goal.** Every feature is judged against whether it improves the lived experience of users over time, not in moments.
2. **The pet loves the user unconditionally.** Affection is never contingent on performance.
3. **Growth is earned, never coerced.** Productivity unlocks development; absence of productivity doesn't punish.
4. **The pet is *yours*.** Personality, biography, and bond are individual to each user.
5. **Forgiveness over punishment.** Generous decay, no death, vacation handling, grace mechanics.
6. **Magic over optimization.** Surprise, emergence, and discovery beat progress bars and grindable meters.
7. **Long-term over short-term.** Designed for years of companionship, not weeks of engagement.
8. **Restraint over noise.** Notifications, animations, prompts — all err toward less.
9. **The pet should feel real.** Behavioral specificity, accumulated history, and felt presence over stats and numbers.
10. **Designed for being put down, not just picked up.** A user who's away for weeks because life is good and full should be welcomed back without guilt.

---

*Last updated: April 17, 2026*
