import { useEffect, useRef, useCallback } from 'react';
import type { PetState } from './types';
import { recordPetInteraction } from '../lib/tauri';

interface Props {
  petState: PetState;
  onPetStateUpdate: (updated: PetState) => void;
  // Allows the parent to externally trigger the reaction glow (e.g., on points earned).
  onRegisterReactionTrigger: (trigger: () => void) => void;
}

const IDLE_FRAME_MS = 1000 / 6;        // 6 fps — ambient, low-energy
const BREATH_PERIOD_MS = 3000;          // one full breath every 3 seconds
const BREATH_AMPLITUDE = 0.04;          // scale 1.0 → 1.04 → 1.0
const REACTION_DURATION_MS = 1500;      // gentle glow for 1.5 seconds

export default function PetView({ petState, onPetStateUpdate, onRegisterReactionTrigger }: Props) {
  const bodyRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameAtRef = useRef(0);
  const reactionStartedAtRef = useRef<number | null>(null);

  // Keep stable refs to props so the RAF closure never goes stale.
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

      // Frame throttle — skip work until the next intended frame.
      if (now - lastFrameAtRef.current < IDLE_FRAME_MS) return;
      lastFrameAtRef.current = now;

      // Breathing scale applied directly to the DOM element (no React re-render).
      if (bodyRef.current) {
        const scale = 1 + BREATH_AMPLITUDE * Math.sin((now / BREATH_PERIOD_MS) * Math.PI * 2);
        bodyRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      }

      // Reaction glow — a warm sine-envelope opacity pulse overlaying the body.
      if (glowRef.current) {
        const reactionStart = reactionStartedAtRef.current;
        if (reactionStart !== null) {
          const elapsed = now - reactionStart;
          if (elapsed >= REACTION_DURATION_MS) {
            reactionStartedAtRef.current = null;
            glowRef.current.style.opacity = '0';
          } else {
            const progress = elapsed / REACTION_DURATION_MS;
            const opacity = (Math.sin(progress * Math.PI) * 0.45).toFixed(4);
            glowRef.current.style.opacity = opacity;
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

  // Register the external reaction trigger so productivity completions can
  // fire the glow without coupling the panels together directly.
  useEffect(() => {
    onRegisterReactionTrigger(() => {
      reactionStartedAtRef.current = performance.now();
    });
  }, [onRegisterReactionTrigger]);

  const handlePetClick = useCallback(() => {
    // Start reaction immediately — don't wait for the DB round-trip.
    reactionStartedAtRef.current = performance.now();

    recordPetInteraction(petStateRef.current.id)
      .then((updated) => onPetStateUpdateRef.current(updated))
      .catch((err: unknown) => {
        console.error('Failed to record pet interaction:', err);
      });
  }, []);

  return (
    <div className="pet-view">
      <svg
        className="pet-svg"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handlePetClick}
        role="button"
        aria-label="Your pet"
      >
        {/* Main body — soft gray-blue placeholder circle */}
        <circle
          ref={bodyRef}
          className="pet-body"
          cx="100"
          cy="100"
          r="50"
          fill="#8ba7c7"
        />
        {/* Reaction glow — warm white pulse that fades in and out on click */}
        <circle
          ref={glowRef}
          cx="100"
          cy="100"
          r="56"
          fill="rgba(255, 248, 220, 1)"
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
      </svg>
    </div>
  );
}
