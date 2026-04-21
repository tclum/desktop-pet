import { useState, useEffect, useRef, useCallback } from 'react';
import type { PetForm, PetPersonality, PetStage, PetState } from './types';
import type { GreetingTier } from '../lib/tauri';
import { recordPetInteraction } from '../lib/tauri';
import starterPng from '../assets/pets/starter.png';
import hatchlingPng from '../assets/pets/hatchling.png';
import stage1CuddlyUrl from '../assets/pets/first_evolution_cuddly.svg?url';
import stage1PowerfulUrl from '../assets/pets/first_evolution_powerful.svg?url';

export type ReactionKind = 'task' | 'focus';

interface Props {
  petState: PetState;
  onPetStateUpdate: (updated: PetState) => void;
  onRegisterReactionTrigger: (trigger: (kind: ReactionKind) => void) => void;
  onRegisterGreetingTrigger: (trigger: (tier: GreetingTier) => void) => void;
}

// Breathing
const IDLE_FRAME_MS = 1000 / 6;   // 6 fps — ambient, low-energy
const BREATH_PERIOD_MS = 3000;
const BREATH_AMPLITUDE = 0.04;

// Reaction glow. Two shapes so the pet has a small vocabulary:
// - task:  fast warm "good!" pulse — quick acknowledgement
// - focus: slower, deeper, held glow — honouring sustained effort.
//          A click (which calls recordPetInteraction) reuses 'task' shape.
const REACTION_TASK_DURATION_MS = 1500;
const REACTION_FOCUS_DURATION_MS = 2600;
const REACTION_TASK_PEAK_OPACITY = 0.45;
const REACTION_FOCUS_PEAK_OPACITY = 0.70;

// Resting-state threshold — after this long without interaction, the pet
// looks slightly quieter (subtle desaturation). Not punishing; just "sleeping."
// Clears instantly when the user interacts and last_interaction_at resets.
const RESTING_THRESHOLD_SECONDS = 24 * 60 * 60;

// Greeting glow — tier-driven "welcome back" on session start.
// Thresholds match the backend tiers in db::check_greeting. Longer absences
// get a gentler, longer wash — never loud, never guilt-laced.
const GREETING_SMALL_DURATION_MS = 1800;
const GREETING_MEDIUM_DURATION_MS = 3200;
const GREETING_LARGE_DURATION_MS = 4500;
const GREETING_SMALL_PEAK_OPACITY = 0.35;
const GREETING_MEDIUM_PEAK_OPACITY = 0.55;
const GREETING_LARGE_PEAK_OPACITY = 0.75;

// Evolution transition timing (ms from transition start).
// Two shapes: a default (starter → hatchling) and an extended reveal for
// stage1, where the new form emerges more slowly through held light — the
// first evolution is when personality is revealed, so the ceremony is longer
// and the glow lingers past the sprite's fade-in start.
const ANTICIPATE_END_MS = 300;
const FADE_OUT_END_MS   = 1300;  // ANTICIPATE + 1000ms fade-out
const PEAK_END_MS       = 1800;  // + 500ms peak hold
const FADE_IN_END_MS    = 3300;  // + 1500ms fade-in

const STAGE1_PEAK_END_MS  = 2500;  // + 1200ms — longer suspense during reveal
const STAGE1_FADE_IN_END_MS = 4700;  // + 2200ms — slower fade-in

function petFormKey(stage: PetStage, personality: PetPersonality | null): PetForm {
  switch (stage) {
    case 'starter':   return 'starter';
    case 'hatchling': return 'hatchling';
    case 'stage1':
      if (personality === 'cuddly') return 'stage1_cuddly';
      if (personality === 'powerful') return 'stage1_powerful';
      return 'stage1_unknown';
    // stage2 not yet built — fall back to hatchling sprite for now.
    default: return 'hatchling';
  }
}

function spriteUrl(form: PetForm): string {
  switch (form) {
    case 'starter':         return starterPng;
    case 'hatchling':       return hatchlingPng;
    case 'stage1_cuddly':   return stage1CuddlyUrl;
    case 'stage1_powerful': return stage1PowerfulUrl;
    // stage1 without personality shouldn't happen in practice (personality is
    // locked in at the transition), but if it does we fall back to hatchling.
    case 'stage1_unknown':  return hatchlingPng;
  }
}

function greetingParams(tier: GreetingTier): [duration: number, peak: number] {
  switch (tier) {
    case 'small':  return [GREETING_SMALL_DURATION_MS, GREETING_SMALL_PEAK_OPACITY];
    case 'medium': return [GREETING_MEDIUM_DURATION_MS, GREETING_MEDIUM_PEAK_OPACITY];
    case 'large':  return [GREETING_LARGE_DURATION_MS, GREETING_LARGE_PEAK_OPACITY];
    default:       return [0, 0];
  }
}

function reactionParams(kind: ReactionKind): [duration: number, peak: number] {
  switch (kind) {
    case 'focus': return [REACTION_FOCUS_DURATION_MS, REACTION_FOCUS_PEAK_OPACITY];
    default:      return [REACTION_TASK_DURATION_MS, REACTION_TASK_PEAK_OPACITY];
  }
}

type EvolutionPhase = 'idle' | 'anticipate' | 'fade_out' | 'peak' | 'fade_in';

interface EvolutionState {
  phase: EvolutionPhase;
  startedAt: number;
  fromForm: PetForm;
  toForm: PetForm;
  // stage1 transitions use longer peak + fade-in timings for the reveal.
  isStage1Reveal: boolean;
}

export default function PetView({
  petState,
  onPetStateUpdate,
  onRegisterReactionTrigger,
  onRegisterGreetingTrigger,
}: Props) {
  // The form currently rendered as the "current" sprite. Lags behind
  // petState's derived form during a transition so we know what we're fading from.
  const [displayForm, setDisplayForm] = useState<PetForm>(() =>
    petFormKey(petState.stage, petState.personality),
  );
  const currentForm = petFormKey(petState.stage, petState.personality);

  const breathWrapperRef = useRef<HTMLDivElement>(null);
  const currentSpriteRef = useRef<HTMLImageElement>(null);
  const nextSpriteRef = useRef<HTMLImageElement>(null);
  const reactionGlowRef = useRef<HTMLDivElement>(null);
  const greetingGlowRef = useRef<HTMLDivElement>(null);
  const evolutionGlowRef = useRef<HTMLDivElement>(null);

  const rafIdRef = useRef<number | null>(null);
  const lastFrameAtRef = useRef(0);
  const reactionRef = useRef<{ startedAt: number; kind: ReactionKind } | null>(null);
  const greetingRef = useRef<{ startedAt: number; tier: GreetingTier } | null>(null);
  const evolutionRef = useRef<EvolutionState>({
    phase: 'idle',
    startedAt: 0,
    fromForm: currentForm,
    toForm: currentForm,
    isStage1Reveal: false,
  });

  const petStateRef = useRef(petState);
  const onPetStateUpdateRef = useRef(onPetStateUpdate);
  useEffect(() => { petStateRef.current = petState; }, [petState]);
  useEffect(() => { onPetStateUpdateRef.current = onPetStateUpdate; }, [onPetStateUpdate]);

  const stopLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    if (rafIdRef.current !== null) return;

    const tick = (now: number) => {
      rafIdRef.current = requestAnimationFrame(tick);

      if (now - lastFrameAtRef.current < IDLE_FRAME_MS) return;
      lastFrameAtRef.current = now;

      const evo = evolutionRef.current;

      if (evo.phase === 'idle') {
        // Normal breathing — only runs when no transition is active.
        if (breathWrapperRef.current) {
          const scale = 1 + BREATH_AMPLITUDE * Math.sin((now / BREATH_PERIOD_MS) * Math.PI * 2);
          breathWrapperRef.current.style.transform = `scale(${scale.toFixed(4)})`;
        }
      } else {
        // Evolution transition — breathing suspended, wrapper held at scale(1).
        if (breathWrapperRef.current) {
          breathWrapperRef.current.style.transform = 'scale(1)';
        }

        const elapsed = now - evo.startedAt;

        if (evo.phase === 'anticipate') {
          // 300ms of stillness — nothing moves, no glow. Just hold.
          if (elapsed >= ANTICIPATE_END_MS) {
            evolutionRef.current = { ...evo, phase: 'fade_out' };
          }

        } else if (evo.phase === 'fade_out') {
          const phaseElapsed = elapsed - ANTICIPATE_END_MS;
          const fadeDuration = FADE_OUT_END_MS - ANTICIPATE_END_MS; // 1000ms

          // Current sprite: 1.0 → 0.2
          const fadeT = Math.min(phaseElapsed / fadeDuration, 1);
          if (currentSpriteRef.current) {
            currentSpriteRef.current.style.opacity = (1 - 0.8 * fadeT).toFixed(4);
          }

          // Glow grows over the first 400ms of this phase, then holds at 1.
          const glowOpacity = phaseElapsed <= 400
            ? (phaseElapsed / 400).toFixed(4)
            : '1';
          if (evolutionGlowRef.current) {
            evolutionGlowRef.current.style.opacity = glowOpacity;
          }

          if (elapsed >= FADE_OUT_END_MS) {
            evolutionRef.current = { ...evo, phase: 'peak' };
          }

        } else if (evo.phase === 'peak') {
          // Sprite frozen at 0.2; glow frozen at 1.0. Wait out the hold.
          const phaseElapsed = elapsed - FADE_OUT_END_MS;
          const peakEnd = evo.isStage1Reveal ? STAGE1_PEAK_END_MS : PEAK_END_MS;
          const peakDuration = peakEnd - FADE_OUT_END_MS;

          if (phaseElapsed >= peakDuration) {
            // Swap sprites: hide old, expose new at opacity 0 / scale 0.85.
            if (currentSpriteRef.current) currentSpriteRef.current.style.opacity = '0';
            if (nextSpriteRef.current) {
              nextSpriteRef.current.style.opacity = '0';
              nextSpriteRef.current.style.transform = 'scale(0.85)';
            }
            setDisplayForm(evo.toForm);
            evolutionRef.current = { ...evo, phase: 'fade_in', startedAt: now };
          }

        } else if (evo.phase === 'fade_in') {
          const fadeDuration = evo.isStage1Reveal
            ? STAGE1_FADE_IN_END_MS - STAGE1_PEAK_END_MS
            : FADE_IN_END_MS - PEAK_END_MS;
          const t = Math.min(elapsed / fadeDuration, 1);

          // New sprite: opacity 0→1, scale 0.85→1.0
          if (nextSpriteRef.current) {
            nextSpriteRef.current.style.opacity = t.toFixed(4);
            nextSpriteRef.current.style.transform = `scale(${(0.85 + 0.15 * t).toFixed(4)})`;
          }

          // Glow curve: the stage1 reveal keeps the glow bright longer so the
          // sprite materialises *through* the light before the light dims.
          // Default: linear 1→0. Stage1: hold at 1 for first 35%, then 1→0
          // across the remaining 65%.
          if (evolutionGlowRef.current) {
            let glowOpacity: number;
            if (evo.isStage1Reveal) {
              glowOpacity = t < 0.35 ? 1 : 1 - (t - 0.35) / 0.65;
            } else {
              glowOpacity = 1 - t;
            }
            evolutionGlowRef.current.style.opacity = Math.max(0, glowOpacity).toFixed(4);
          }

          if (t >= 1) {
            // Transition complete — restore clean state.
            if (currentSpriteRef.current) currentSpriteRef.current.style.opacity = '1';
            if (nextSpriteRef.current) {
              nextSpriteRef.current.style.opacity = '0';
              nextSpriteRef.current.style.transform = 'scale(1)';
            }
            if (evolutionGlowRef.current) evolutionGlowRef.current.style.opacity = '0';
            evolutionRef.current = {
              phase: 'idle',
              startedAt: 0,
              fromForm: evo.toForm,
              toForm: evo.toForm,
              isStage1Reveal: false,
            };
          }
        }
      }

      // Reaction glow (independent of evolution state).
      if (reactionGlowRef.current) {
        const reaction = reactionRef.current;
        if (reaction !== null) {
          const [duration, peakOpacity] = reactionParams(reaction.kind);
          const elapsed = now - reaction.startedAt;
          if (elapsed >= duration) {
            reactionRef.current = null;
            reactionGlowRef.current.style.opacity = '0';
          } else {
            const progress = elapsed / duration;
            reactionGlowRef.current.style.opacity =
              (Math.sin(progress * Math.PI) * peakOpacity).toFixed(4);
          }
        }
      }

      // Greeting glow (independent of reaction and evolution).
      // Small: single sine pulse. Medium: single sustained pulse, higher peak.
      // Large: same curve as medium but slower and warmer — more "there you are."
      if (greetingGlowRef.current) {
        const greeting = greetingRef.current;
        if (greeting !== null) {
          const [duration, peakOpacity] = greetingParams(greeting.tier);
          const elapsed = now - greeting.startedAt;
          if (elapsed >= duration) {
            greetingRef.current = null;
            greetingGlowRef.current.style.opacity = '0';
          } else {
            const progress = elapsed / duration;
            greetingGlowRef.current.style.opacity =
              (Math.sin(progress * Math.PI) * peakOpacity).toFixed(4);
          }
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      document.hidden ? stopLoop() : startLoop();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!document.hidden) startLoop();
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopLoop();
    };
  }, [startLoop, stopLoop]);

  // Detect form change (stage or personality) — start evolution transition.
  // We watch form (not raw stage) so hatchling → stage1_cuddly triggers even
  // though both stages report different values only through personality lock-in.
  useEffect(() => {
    const evo = evolutionRef.current;
    if (currentForm !== evo.fromForm && evo.phase === 'idle') {
      evolutionRef.current = {
        phase: 'fade_out',
        startedAt: performance.now(),
        fromForm: evo.fromForm,
        toForm: currentForm,
        isStage1Reveal: petState.stage === 'stage1',
      };
    }
  }, [currentForm, petState.stage]);

  useEffect(() => {
    onRegisterReactionTrigger((kind: ReactionKind) => {
      reactionRef.current = { startedAt: performance.now(), kind };
    });
  }, [onRegisterReactionTrigger]);

  useEffect(() => {
    onRegisterGreetingTrigger((tier: GreetingTier) => {
      if (tier === 'none') return;
      greetingRef.current = { startedAt: performance.now(), tier };
    });
  }, [onRegisterGreetingTrigger]);

  const handlePetClick = useCallback(() => {
    // Only react to clicks outside a transition.
    if (evolutionRef.current.phase !== 'idle') return;
    // Click reactions reuse the 'task'-shaped pulse — quick, warm, friendly.
    reactionRef.current = { startedAt: performance.now(), kind: 'task' };
    recordPetInteraction(petStateRef.current.id)
      .then((updated) => onPetStateUpdateRef.current(updated))
      .catch((err: unknown) => {
        console.error('Failed to record pet interaction:', err);
      });
  }, []);

  const isResting =
    petState.seconds_since_last_interaction >= RESTING_THRESHOLD_SECONDS &&
    evolutionRef.current.phase === 'idle';

  return (
    <div
      className={`pet-view${isResting ? ' pet-view--resting' : ''}`}
      onClick={handlePetClick}
      role="button"
      aria-label="Your pet"
    >
      {/* Breathing wrapper — scale transform applied here so both sprites move together */}
      <div ref={breathWrapperRef} className="pet-breath-wrapper">
        {/* Current (from) sprite — fades out during transition */}
        <img
          ref={currentSpriteRef}
          className="pet-sprite"
          src={spriteUrl(displayForm)}
          alt=""
          draggable={false}
        />
        {/* Incoming (to) sprite — pre-loaded in DOM at opacity 0, fades in during transition */}
        <img
          ref={nextSpriteRef}
          className="pet-sprite pet-sprite--next"
          src={spriteUrl(currentForm)}
          alt=""
          draggable={false}
          style={{ opacity: 0 }}
        />
      </div>

      {/* Reaction glow — warm pulse on click / points earned */}
      <div ref={reactionGlowRef} className="pet-reaction-glow" style={{ opacity: 0 }} />

      {/* Greeting glow — tier-driven "welcome back" on session start */}
      <div ref={greetingGlowRef} className="pet-greeting-glow" style={{ opacity: 0 }} />

      {/* Evolution glow — expanding radial wash during stage transition */}
      <div ref={evolutionGlowRef} className="pet-evolution-glow" style={{ opacity: 0 }} />
    </div>
  );
}
