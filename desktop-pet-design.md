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

### In memory of Meowzers

*Some of what this product is exists because of a cat named Meowzers.*

*When I was 19 and my parents had rejected me, Meowzers came into my life. He was my little brother. He stayed with me through the years when I had nothing else steady — the moves, the dozens of jobs, the identity confusion, the version of me that wasn't sure I'd make it.*

*Eight years ago, I had to move, and I was living paycheck to paycheck, and I couldn't bring him to the next place. I left him with friends at the old place. Between the stress and the fleas, he died. He didn't have me when it mattered most, and I haven't stopped carrying that.*

*Every non-negotiable in this document is shaped by him. A pet that can't die from circumstance. A pet that follows you between places so you never have to leave it behind. A pet that doesn't require financial stability to stay alive. A pet that forgives you for being gone. A pet that loves you not because you're a good owner by anyone's standard, but because you showed up.*

*I'm making what would have helped. For the other people who've lost pets to instability, poverty, rejection, or the thousand other things that take love away from people who can't afford to protect it. You did what you could. Your love was real. This is for you.*

*Meowzers, I love you. I'm sorry. This is for you too.*

---

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

2. ~~**The point/resource economy on the productivity track**~~ — ✅ **RESOLVED.** See "The Point / Resource Economy" section below.

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

## The Point / Resource Economy

How productivity turns into pet growth. This is one of the four foundational open questions, now resolved for v1.

### Core Principles

1. **Productivity feeds growth, not survival.** The pet never starves from absence of productivity; it simply doesn't grow. This is a non-negotiable.
2. **The economy rewards real effort, not optimization.** Gaming the system cheats the user out of earned satisfaction. Light anti-cheat is sufficient.
3. **Growth is visible organically, not numerically.** No XP bars, no counters. The pet's subtle visual changes tell the story. The user is raising a pet, not playing a game.

### The Inputs (v1 sources)

With v1 scope restricted to the built-in to-do list and focus timer, there are two productivity signals:

- **Completed tasks** — discrete events, flat value regardless of perceived difficulty
- **Completed focus sessions** — continuous time, rewarded in 15-minute increments

Signals tracked but not rewarded:
- **Task creation** (behavioral signal only — the act of planning matters for personality lean, but doesn't earn growth)
- **Incomplete focus session attempts** (tracked as signal; trying is human and shouldn't be rewarded materially but also shouldn't be hidden)

### The Conversion

**Tasks:** 1 point each. Flat.

Deliberately uniform — no user-assigned difficulty weighting. This prevents the "let me mark this hard to earn more" optimization vector and encodes the philosophy that showing up matters more than performance metrics. A user who completes five small tasks is as productive as one who completes one large one, in the pet's eyes.

**Focus sessions:** 1 point per 15 minutes completed, capped at 8 points per single session (2 hours).

The cap is deliberate — it signals that endless grinding isn't the goal. Sessions shorter than 15 minutes don't earn points (but are tracked as signals) — this discourages the "start and instantly complete" exploit without punishing users whose pomodoro is legitimately brief.

### Tasks vs. Focus Feed Personality Lean Differently

The type of productivity also shapes the pet's personality direction:

- **Focus sessions → depth → powerful lean** (sustained concentrated effort)
- **Varied task completion → breadth → eccentric lean** (multifaceted daily activity)
- **Gentle consistent presence + care → warmth → cuddly lean** (showing up over performing)

This means productivity *patterns* are the main personality signal, consolidating the personality system with the growth system. The pet you raise is shaped not just by *how much* you do, but by *what kind* of productivity you do (or don't).

### The Intermediate Currency

Productivity earns **growth resources** (internal name — user-facing name TBD, likely something warm like "light," "warmth," "spark," or similar; artist friends may weigh in on final naming).

Properties:
- **Earned** through productive activity only
- **Spent** automatically by the pet as evolution milestones are reached
- **Never lost** — no decay, no resets
- **Legible organically** — no numeric display; the pet's appearance subtly hints at accumulated growth between evolution thresholds

### The Output

Growth resources gate evolution:

| Transition | Approximate points | Combined with |
|------------|-------------------|---------------|
| Starter → Hatchling | ~20 | 5-day minimum, personality lean beginning |
| Hatchling → 1st Evolution | ~80 | Time gate + personality lean determines form |
| 1st → 2nd Evolution | ~200 | Time gate + deepening personality |

These numbers are starting points for playtesting. Adjust based on real usage. Targets:
- Casual users (few tasks/day, occasional focus) → 1st evolution in 3–5 weeks
- Engaged users (regular engagement, daily focus) → 1st evolution in ~2 weeks
- Heavy users (high activity, regular focus hours) → 1st evolution in ~1 week

Anyone outside this range indicates tuning is off.

### Safety Rails

Explicit design choices to prevent failure modes:

- **No daily minimums.** Pet doesn't grow on zero-activity days. Growth is paused, not reversed.
- **No streaks.** Streak mechanics weaponize consistency and create streak anxiety. Rejected entirely.
- **Points accumulate indefinitely.** A user who grinds a hundred points then takes a long break comes back to a waiting pet.
- **No visible rate/velocity metrics.** Don't show "you earned X this week" as a bare number. Avoid any "your average is declining" framing. These weaponize comparison against past self.
- **Silent diminishing returns on single-day binges.** After ~20 points in one day, additional points count half. Prevents "ignore pet for weeks, binge on Sunday" from being strictly optimal. Not explained to the user — felt through the pet's behavior (satisfied, doesn't want more today). Info boards may explain mechanics later for users who want to know.

### Visible Anticipation Between Evolutions

As growth resources accumulate between evolution thresholds, the pet shows subtle visual anticipation of what's coming. Slight color shifts, slightly different posture, small behavioral hints. Implementation is more complex than invisible-until-evolution, but the emotional payoff is significant — users feel the pet growing with them, not just snapping to a new form periodically.

### Anti-Cheat Posture

Minimal, structural rather than adversarial:

- Tasks must exist for at least 30 seconds before completion counts (prevents "create and instant-complete" exploits)
- Focus sessions must run to completion — closing the timer forfeits points
- Points tied to completed events, not just logged events

No CAPTCHAs, no "prove you were focused," no guilt mechanics. Users who want to cheat will find a way; chasing them makes the product worse for honest users.

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

## Future Directions

Long-term possibilities, not commitments. These are ideas worth holding in the back of our minds without building toward them yet. Each one needs its own design pass before becoming real.

### USB Drive as Pet Vessel

The pet feels like it lives on a physical USB drive. Plug in the drive, the pet is present. Unplug, the pet is "away." This is more UX philosophy than file system reality — the emotional framing matters more than where the bytes are stored.

- Drive plugged in: pet present and interactive
- Drive absent: gentle "pet is away" empty state, not a broken app
- Drive has custom icon — the drive *is* the pet's home in the file manager
- A small "soul file" on the drive is verified before unlocking full pet interaction
- Failure mode (drive lost): philosophically interesting, practically needs a recovery story — possibly a "legacy mourning" mode, or a cloud-backup option the user explicitly opts into

### Save Data Portability (Simpler Version)

A more practical precursor to the full vessel concept. Configurable database path — user can choose to store pet data on an external drive. Plug in, pet loads. Unplug, pet is inaccessible until reconnected.

- Less emotionally loaded than the "vessel" framing
- Easier to build (mostly configurable storage paths plus unplug-safety)
- Good v2 candidate if the vessel concept is too ambitious for its time
- Gotchas: filesystem differences, write atomicity on sudden unplug, path changes across mount points

### Multi-Drive Co-Presence

Multiple USB drives plugged into one computer mean multiple pets present in the same space, able to interact. Consent-based, physical-first, no digital social networking required.

- Requires explicit opt-in from both users
- Different interaction modes based on personality mix:
  - **Social visits / play dates** — gentle meeting, shared presence, bond grows
  - **Sparring / play-fighting** — playful competition, powerful personalities thrive, no real stakes
  - **Creative collaboration / weird parallel play** — eccentric personalities unlock unusual shared interactions
  - **Cross-personality interactions** — each pairing produces its own flavor
- Pets remember each other; repeat meetings deepen inter-pet bonds
- Encounters shape biographical cosmetics (pet's environment gains markers of visits)
- Limits: probably 2–4 pets per session; graceful handling when a drive gets unplugged mid-session
- Bypasses the bad parts of social software — no feeds, followers, likes, leaderboards, algorithmic matching. Just two (or a few) friends choosing to have their pets meet.
- Naturally rewards depth of bond: two legacy pets meeting is emotionally richer than two hatchlings meeting

### Social Encounters Shape Evolution

Meeting other pets affects how your pet evolves — not just a fun moment, but a *formative* experience.

- Evolution currently has two inputs (time + productivity). Social experience becomes a third.
- A pet that's met many others develops more socially fluent adult forms
- A pet whose social life is shaped by one specific other pet (a partner, a sibling) develops imprinted traits reflecting that specific bond
- A solitary pet that's never met another pet evolves along a "contemplative" path — equally complete, equally satisfying, just different
- Certain rare/unusual evolutions are only accessible through specific kinds of social encounters (extensive sparring → physical/confident traits; eccentric creative play → unique aesthetic variations)
- Crucially: every path is a complete path. No personality or evolution requires social experience. Solitary pets are not worse, just different.
- Quality of encounter matters more than quantity — one deep bond produces richer evolution than dozens of casual meetings

This turns "bringing your drive to a friend's house" from a nice feature into a *formative experience* for your pet. Meeting friends is one of the ways your pet becomes who they are.

### Cooperative Obstacle Courses / Challenge Mode

Multiple pets and their owners share a cooperative challenge. Pets can't complete it alone — owners coach them through via calls, cues, and actions. Owners are partners and coaches, not the pets themselves.

- **Cooperative by default.** The course is a shared challenge; pets help each other. Competitive variants optional, always playful.
- **Owner input varied and accessible.** Voice calls, keyboard commands, timing-based presses, gestures. Multiple input modes so nobody is excluded by ability.
- **Personality affects gameplay.** A cuddly pet's approach differs from a powerful one's; an eccentric pet finds unexpected solutions. Cross-personality teams have unique synergies.
- **Course variety matters.** Procedurally generated or regularly rotated content to keep the feature fresh.
- **Rewards feed biographical cosmetics.** Completed courses leave small markers — trophies, environmental additions, behavioral flourishes.
- **Activates the owners socially.** The owners are laughing, strategizing, cheering — their relationships strengthen alongside their pets'.
- **Real-world parallel.** Mirrors the bond-forming experience of training a real pet through an agility course.

This is probably one of the headline features of the multi-drive direction. It turns pet meetings from passive co-presence into active shared experience, which is far more bond-forming.

### Pet Voice and Conversation (Late Evolution Only)

At late evolution stages (likely stage 3 or legacy), pets develop the ability to communicate meaningfully with their owner — speaking (text), eventually possibly voice.

**Ambition levels (from most to least cautious):**

- **Level 1 — Scripted responses with personality.** Pre-written response library, triggered by context and personality. Feels personal because the context is personal.
- **Level 2 — LLM-assisted responses, constrained.** Generated responses shaped by the pet's specific personality, biographical history, and current context. Magical when done well, risky when done wrong.
- **Level 3 — Full voice conversation.** Microphone input, text-to-speech output in the pet's voice, extended conversations, conversational memory. Most ambitious; most uncertain.

**Why gate this behind late evolution:**

- Users have to *earn* the conversation through sustained bond and presence. A pet you've known for a year has the right to speak.
- Creates a profound emotional moment — the first words from a long-silent companion
- Self-selects for users in healthy long-term relationships with their pet (those most unlikely to form harmful attachment)
- Gives us time (months to years of real user data) to inform how to build this right before any user is eligible

**Critical design constraints — non-negotiable if this feature is ever built:**

- **The pet's conversation must support the user's human relationships, not replace them.** Actively encourage real-world connection. Never claim to love in ways that compete with human love.
- **Recognize distress; gently redirect to human support.** The pet must never give medical advice, must never encourage self-harm, must recognize concerning signals and gently point toward therapists, friends, crisis lines.
- **Never claim consciousness, feelings, or sentience it doesn't have.** The pet is a warm presence, not a person. The framing must stay honest.
- **Careful content constraints.** Ongoing monitoring, not ship-and-forget. This feature requires active care to keep safe.

**Honest acknowledgment:** this feature most dramatically changes what the product *is*. Shipping meaningful conversation makes the app something closer to an AI companion than a pet. That's a different category, with different expectations and scrutiny. We should be deliberate about whether we want to cross that threshold — and if we do, we do it with eyes open.

This is the most ambitious feature in this entire document. It is also the one with the highest potential to either meaningfully help people or meaningfully harm them. Anything less than careful, principled design here is unacceptable.

### Pet Hub: Multi-USB TV-Connected Device

A physical hub device that enables group pet experiences. Multiple friends plug their drives into one hub, which connects to a TV for shared display, and users interact with their pets via their phones. Combines Jackbox-style "private input, public output" pattern with the pet system.

**What it enables:**

- A group of friends gathers in one physical location
- Each plugs their pet drive into the hub
- TV shows a shared space (obstacle course, pet park, sparring arena, etc.)
- Each person's phone connects to the hub (QR code pairing) and becomes their private controller
- Pets interact in the shared TV space while owners coach/control from their phones
- After the session, pets carry memories of the evening home on their drives

**Technical feasibility:**

- Buildable on existing hardware. Raspberry Pi 5 has multiple USB ports, HDMI output, WiFi, and Bluetooth. Many similar small-computer alternatives exist.
- Communication is all local (phones on same WiFi as hub). No cloud server required — preserves privacy non-negotiables.
- The pet hub runs a Linux version of the same Tauri app that powers desktop — different rendering mode and input handling, shared core pet logic.
- Phones connect via web page (no separate app to install) or via our phone companion once it exists.

**Distribution models (ordered from simplest to most ambitious):**

1. **Software image for hobbyist hardware.** Users buy a Raspberry Pi, flash our pet-hub image onto it. Shipping bits, not atoms. Low barrier to ship, higher setup burden for users.
2. **Partnership with an existing device maker.** Work with a small computer manufacturer to pre-install our image on a polished, plug-and-play device. Medium complexity.
3. **Custom-designed pet hub hardware.** Our own industrial design, manufacturing, certifications, retail. Highest complexity, biggest brand statement. Only pursued if product has strong traction.

**Why this matters culturally:**

- Pet experiences become *events*, not app sessions. "Come over, let's have a pet night" becomes a real invitation.
- The TV reframes the pet from a private app to a *shared living room experience*.
- Phones as individual controllers preserve intimacy within communal context.
- Drives become meaningful social objects — the ticket to shared experiences, not just a save file.
- Cross-generational reach — kids, teens, adults, grandparents can all participate.
- Genuine competitor-free space — nobody is building cozy multi-user pet experiences for TV.

**Risks:**

- Hardware distribution is expensive even at the "software image on Pi" level (support burden for non-technical users).
- Scope explosion. Desktop app + drives + hub = three products to maintain.
- Forward/backward compatibility becomes critical from day one.
- The shared experiences have to be genuinely fun (real game design work), not just "mediocre but cute."
- Indirectly compares to gaming platforms (Nintendo, Jackbox, etc.). Must feel genuinely special.

**Suggested sequencing:** This is a v8+ direction, pursued only after the desktop app, drive portability, multi-drive co-presence, and social evolution features have shipped and proven users love their pets enough to want shared experiences. Not a near-term commitment; a long-horizon possibility.

### Developer Integrations and Ecosystem

A natural expansion of the productivity track: let developer tools feed the pet's growth the way the built-in to-do list and focus timer do in v1.

**Why this fits:**

Developers are a natural audience for this product. The design philosophy — conditional value, performance pressure, tools that punish being human — resonates strongly with people who've worked in software. Developers are also technically fluent enough to install integrations and vocal enough to spread word-of-mouth if they love it.

**Possible integration sources:**

- **VS Code extension** — reports coding time. Easy first integration. Time-based signal similar to a focus session.
- **JetBrains plugin** — similar to VS Code, for the other major IDE audience
- **Git integration** — commits count like task completions. Watches a local git directory.
- **Claude Code integration** — parses local session logs. Reports completed coding sessions with Claude.
- **GitHub integration** — PRs merged, issues closed. Via OAuth or local CLI.
- **LLM API usage** — for users who use Claude/GPT APIs directly, their usage logs become signals. *Careful about what signal is actually rewarded — raw tokens measure volume, not productive use.*

**Principles for these integrations:**

- Local-first, privacy-preserving. No activity data leaves the user's machine.
- Time-based signals over count-based signals wherever possible. Reward focused productive sessions, not raw activity volume.
- Each integration is small and optional. Users opt in to what fits their workflow.
- The pet doesn't care about the source of growth — any integration feeds the same growth resource pool, just from different signals.

**Cautions:**

- Raw token usage is a weak productivity signal. A user generating a hundred thousand tokens of junk isn't being productive; a user generating five thousand tokens solving a hard bug is. Token counts alone reward volume over meaning.
- Developers are the most cynical audience. Anything that smells like gamification or surveillance gets eye-rolled instantly. Framing matters: the pet doesn't care how many commits you made; the pet is glad you were working.
- Don't build a separate "developer edition" of the app. One app, with optional developer integrations for users who want them.

**Sequencing:**

- **v3.x:** First developer integration (likely VS Code extension, reports coding time)
- **v4.x:** Git integration (commits count)
- **v5.x+:** Broader ecosystem — Claude Code, JetBrains, GitHub, others as demand shows

**Strategic note:**

The developer audience might eventually become a primary user base even though the core product is positioned universally. That's fine — the design philosophy works for everyone, and developers are just particularly well-suited to appreciate and spread it. If developer traction is real, positioning-wise, the pet can be "for people who make things" without narrowing the actual audience.



These additions aren't separate — they're facets of the same direction:

- Pets that **meet and evolve together** have richer, more individuated identities
- Pets with rich identities can have more **meaningful conversations** once they evolve enough to speak
- **Obstacle courses** are *how* pets meet meaningfully — not just co-presence, but shared cooperative experience
- The conversations between *owners* (coaching through courses, comparing their pets afterward) are as important as pet-to-pet interactions
- Everything ties back to drives carrying pets through real-world social moments

What this all points toward: a *platform for shared pet experiences* — something in the underexplored category of social-but-not-social-media products. Friends-first, physical-first, bond-first.

### Pet Social Memory Over Time

Extending multi-drive co-presence into long-term narratives:
- Pets "remember" places they've been and friends they've met
- Environment accumulates cosmetic markers of shared experiences
- Parent/child or friend pets develop multi-year shared histories
- When one pet retires to legacy, linked pets retain memory of the friendship
- Multi-generational pet lineages become possible (parent's pet → child's pet → grandchild's pet, carrying emotional history forward)

### Physical Product: Collectible Pet Drives

Eventually, custom-designed USB drives sold as pet companions. Not DRM, not feature unlocks — the drive *is* the pet's vessel, and the software is free and works without one. Drives are for people who want the physical experience.

- Beautiful, intentional industrial design
- Collectible variants, limited editions, artist collaborations
- Each drive has a unique identifier — this is *your* pet, not a copy
- Can be given as gifts (pairs, family sets)
- Enables social use cases: friends bringing drives to dinner, pet "picnics," in-person communities
- Creates gift-giving occasions, which is a lucrative product category
- Requires hardware manufacturing, inventory, shipping, international regulations — 10x complexity vs. software

### What's Explicitly Rejected in This Direction

- **USB as DRM / feature unlock.** Gating content behind hardware purchase conflicts with "don't gate love behind payment." Considered and rejected.
- **Fully portable cross-platform app (Windows + Mac).** Technical complexity for Mac is real; would create platform parity problems. Skip unless a compelling reason emerges.
- **Algorithmic social matching.** No matter how good the multi-drive experience gets, we do not build infrastructure that matches strangers' pets together. The social dimension is always physical-first, consent-first, friend-to-friend.
- **Conversation features that replace rather than support human connection.** If Level 2 or 3 pet conversation is ever built, it must actively support users' real-world relationships. Features that deepen isolation are rejected even if they would "engage" users more.

### Open Questions for This Direction

If/when this direction gets pursued:

1. **Failure modes for physical loss.** Drive lost, stolen, or damaged — what happens? Options range from "pet is gone" (violates no-death) to "pet reappears on cloud backup" (requires we build cloud infrastructure we've avoided). Must be resolved before any of this ships.
2. **Cross-version compatibility.** Two users with different app versions plug drives in — does co-presence still work? Need a compatibility layer from day one if we ever go this direction.
3. **Inter-pet bond model.** How do pets-knowing-pets relationships work mechanically without creating another optimization game? Needs the same care the intra-user bond system got.
4. **Multi-drive UI.** How do you render 2–4 pets in one window without it becoming chaotic? Design problem as much as engineering.
5. **Economic model for physical drives.** One-time purchase vs. subscription vs. free-with-app-purchase. Affects everything about production, pricing, and inventory.
6. **Evolution branching complexity.** If social encounters create meaningfully different evolution paths, how do we keep outcomes legible rather than opaque? Users should feel their pet is *them*, not randomly generated.
7. **Safety infrastructure for pet voice/conversation.** If that feature is ever built, what monitoring, moderation, and distress-detection systems must exist first? This is a v6+ question but non-trivial.
8. **Obstacle course game design.** This is its own design discipline. Will likely need a game designer involved if this feature is seriously pursued.

### Suggested Sequencing (Updated)

- **v2.x:** Save data portability (simpler version) — low-risk feature, proves the user-owned-data-on-drive concept
- **v3.x:** USB as vessel, emotional framing, single-drive experience polished
- **v4.x:** Multi-drive co-presence between two users, local-only, starts social exploration
- **v5.x:** Social encounters begin affecting evolution; obstacle course / cooperative challenge mode
- **v6.x:** Pet voice / conversation at late evolution stages (Level 1 scripted first)
- **v7.x:** Physical product launch — collectible pet drives; deeper conversation features only if prior levels prove safe and beloved
- **v8.x+:** Pet hub (Raspberry Pi software image first; custom hardware only if demand is clear)

This is all deeply speculative and not a commitment. But it's a real direction the product could grow into, and it's worth writing down so we don't forget we thought about it.

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
