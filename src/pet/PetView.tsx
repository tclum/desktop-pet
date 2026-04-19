import { useState, useEffect, useRef, useCallback } from 'react';
import type { PetState, PetStage } from './types';
import { recordPetInteraction } from '../lib/tauri';
import starterPng from '../assets/pets/starter.png';
import hatchlingPng from '../assets/pets/hatchling.png';

interface Props {
  petState: PetState;
  onPetStateUpdate: (updated: PetState) => void;
  onRegisterReactionTrigger: (trigger: () => void) => void;
}

// Breathing
const IDLE_FRAME_MS = 1000 / 6;   // 6 fps — ambient, low-energy
const BREATH_PERIOD_MS = 3000;
const BREATH_AMPLITUDE = 0.04;

// Reaction glow (click / points earned)
const REACTION_DURATION_MS = 1500;

// Evolution transition timing (ms from transition start)
const FADE_OUT_END_MS = 800;
const PEAK_END_MS = 1100;       // FADE_OUT_END_MS + 300ms peak hold
const FADE_IN_END_MS = 1900;    // PEAK_END_MS + 800ms fade-in

function spriteUrl(stage: PetStage): string {
  switch (stage) {
    case 'starter':   return starterPng;
    case 'hatchling': return hatchlingPng;
    // stage1 / stage2 fall back to hatchling until those sprites are added.
    default:          return hatchlingPng;
  }
}

type EvolutionPhase = 'idle' | 'fade_out' | 'peak' | 'fade_in';

interface EvolutionState {
  phase: EvolutionPhase;
  startedAt: number;
  fromStage: PetStage;
  toStage: PetStage;
}

export default function PetView({ petState, onPetStateUpdate, onRegisterReactionTrigger }: Props) {
  // The stage currently rendered as the "current" sprite. Lags behind
  // petState.stage during a transition so we know what we're fading from.
  const [displayStage, setDisplayStage] = useState<PetStage>(petState.stage);

  const breathWrapperRef = useRef<HTMLDivElement>(null);
  const currentSpriteRef = useRef<HTMLImageElement>(null);
  const nextSpriteRef = useRef<HTMLImageElement>(null);
  const reactionGlowRef = useRef<HTMLDivElement>(null);
  const evolutionGlowRef = useRef<HTMLDivElement>(null);

  const rafIdRef = useRef<number | null>(null);
  const lastFrameAtRef = useRef(0);
  const reactionStartedAtRef = useRef<number | null>(null);
  const evolutionRef = useRef<EvolutionState>({
    phase: 'idle',
    startedAt: 0,
    fromStage: petState.stage,
    toStage: petState.stage,
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
        // Normal breathing.
        if (breathWrapperRef.current) {
          const scale = 1 + BREATH_AMPLITUDE * Math.sin((now / BREATH_PERIOD_MS) * Math.PI * 2);
          breathWrapperRef.current.style.transform = `scale(${scale.toFixed(4)})`;
        }
      } else {
        // Evolution transition — breathing suspended, scale held at 1.
        if (breathWrapperRef.current) {
          breathWrapperRef.current.style.transform = 'scale(1)';
        }

        const elapsed = now - evo.startedAt;

        if (evo.phase === 'fade_out') {
          // Current sprite fades from 1.0 → 0.2 over 800ms.
          const t = Math.min(elapsed / FADE_OUT_END_MS, 1);
          if (currentSpriteRef.current) {
            currentSpriteRef.current.style.opacity = String((1 - 0.8 * t).toFixed(4));
          }
          // Glow: 0→1 over first 400ms, then holds at 1.
          const glowOpacity = elapsed <= 400
            ? (elapsed / 400).toFixed(4)
            : '1';
          if (evolutionGlowRef.current) {
            evolutionGlowRef.current.style.opacity = glowOpacity;
          }
          if (elapsed >= FADE_OUT_END_MS) {
            evolutionRef.current = { ...evo, phase: 'peak' };
          }
        } else if (evo.phase === 'peak') {
          // Sprite frozen at 0.2; glow frozen at 1.0.
          if (elapsed >= PEAK_END_MS - FADE_OUT_END_MS) {
            // Swap sprites: hide the old one, start showing the new one at 0.
            if (currentSpriteRef.current) currentSpriteRef.current.style.opacity = '0';
            if (nextSpriteRef.current)    nextSpriteRef.current.style.opacity = '0';
            setDisplayStage(evo.toStage);
            evolutionRef.current = { ...evo, phase: 'fade_in', startedAt: now };
          }
        } else if (evo.phase === 'fade_in') {
          const t = Math.min(elapsed / (FADE_IN_END_MS - PEAK_END_MS), 1);
          // New sprite fades in; glow fades out.
          if (nextSpriteRef.current) {
            nextSpriteRef.current.style.opacity = t.toFixed(4);
          }
          if (evolutionGlowRef.current) {
            evolutionGlowRef.current.style.opacity = (1 - t).toFixed(4);
          }
          if (elapsed >= FADE_IN_END_MS - PEAK_END_MS) {
            // Transition complete — reset to idle state.
            if (currentSpriteRef.current) currentSpriteRef.current.style.opacity = '1';
            if (nextSpriteRef.current)    nextSpriteRef.current.style.opacity = '0';
            if (evolutionGlowRef.current) evolutionGlowRef.current.style.opacity = '0';
            evolutionRef.current = {
              phase: 'idle',
              startedAt: 0,
              fromStage: evo.toStage,
              toStage: evo.toStage,
            };
          }
        }
      }

      // Reaction glow (independent of evolution state).
      if (reactionGlowRef.current) {
        const reactionStart = reactionStartedAtRef.current;
        if (reactionStart !== null) {
          const elapsed = now - reactionStart;
          if (elapsed >= REACTION_DURATION_MS) {
            reactionStartedAtRef.current = null;
            reactionGlowRef.current.style.opacity = '0';
          } else {
            const progress = elapsed / REACTION_DURATION_MS;
            reactionGlowRef.current.style.opacity = (Math.sin(progress * Math.PI) * 0.45).toFixed(4);
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

  // Detect stage change — start evolution transition.
  useEffect(() => {
    const evo = evolutionRef.current;
    if (petState.stage !== evo.fromStage && evo.phase === 'idle') {
      evolutionRef.current = {
        phase: 'fade_out',
        startedAt: performance.now(),
        fromStage: evo.fromStage,
        toStage: petState.stage,
      };
    }
  }, [petState.stage]);

  useEffect(() => {
    onRegisterReactionTrigger(() => {
      reactionStartedAtRef.current = performance.now();
    });
  }, [onRegisterReactionTrigger]);

  const handlePetClick = useCallback(() => {
    // Only react to clicks outside a transition.
    if (evolutionRef.current.phase !== 'idle') return;
    reactionStartedAtRef.current = performance.now();
    recordPetInteraction(petStateRef.current.id)
      .then((updated) => onPetStateUpdateRef.current(updated))
      .catch((err: unknown) => {
        console.error('Failed to record pet interaction:', err);
      });
  }, []);

  return (
    <div className="pet-view" onClick={handlePetClick} role="button" aria-label="Your pet">
      {/* Breathing wrapper — scale transform applied here so both sprites move together */}
      <div ref={breathWrapperRef} className="pet-breath-wrapper">
        {/* Current (from) sprite — fades out during transition */}
        <img
          ref={currentSpriteRef}
          className="pet-sprite"
          src={spriteUrl(displayStage)}
          alt=""
          draggable={false}
        />
        {/* Incoming (to) sprite — pre-loaded in DOM at opacity 0, fades in during transition */}
        <img
          ref={nextSpriteRef}
          className="pet-sprite pet-sprite--next"
          src={spriteUrl(petState.stage)}
          alt=""
          draggable={false}
          style={{ opacity: 0 }}
        />
      </div>

      {/* Reaction glow — warm pulse on click / points earned */}
      <div ref={reactionGlowRef} className="pet-reaction-glow" style={{ opacity: 0 }} />

      {/* Evolution glow — expanding radial wash during stage transition */}
      <div ref={evolutionGlowRef} className="pet-evolution-glow" style={{ opacity: 0 }} />
    </div>
  );
}
