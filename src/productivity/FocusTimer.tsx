import { useState, useEffect, useRef, useCallback } from 'react';
import type { FocusPhase } from './types';
import { startFocusSession, completeFocusSession, abortFocusSession } from '../lib/tauri';

const MIN_DURATION_MINUTES = 5;
const MAX_DURATION_MINUTES = 120;
const STEP_MINUTES = 5;
const DEFAULT_DURATION_MINUTES = 25;

// Rotate through these on each completion — no repetition within a session.
const COMPLETION_MESSAGES = ['Good session.', 'Nice focus.', 'Thanks for that.'];

interface Props {
  onPointsEarned: (points: number) => void;
}

export default function FocusTimer({ onPointsEarned }: Props) {
  const [targetMinutes, setTargetMinutes] = useState(DEFAULT_DURATION_MINUTES);
  const [phase, setPhase] = useState<FocusPhase>('idle');
  // Remaining ms shown in the display — updated via RAF, not setInterval.
  const [displayRemainingMs, setDisplayRemainingMs] = useState(
    DEFAULT_DURATION_MINUTES * 60 * 1000,
  );
  const [completionMessage, setCompletionMessage] = useState('');

  // Refs used inside the RAF closure — avoids stale captures.
  const rafIdRef = useRef<number | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);       // performance.now() when started/resumed
  const pausedDurationMsRef = useRef<number>(0); // total accumulated paused time
  const pausedAtRef = useRef<number | null>(null);
  const targetMsRef = useRef(DEFAULT_DURATION_MINUTES * 60 * 1000);
  const completionIndexRef = useRef(0);
  // Track last second displayed so we only call setState once per second.
  const lastDisplayedSecondRef = useRef(-1);

  const stopRaf = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const startRaf = useCallback(() => {
    if (rafIdRef.current !== null) return;

    const tick = (now: number) => {
      const elapsed = now - startedAtRef.current - pausedDurationMsRef.current;
      const remaining = Math.max(0, targetMsRef.current - elapsed);
      const remainingSeconds = Math.ceil(remaining / 1000);

      // Only update React state when the displayed second changes (~1 setState/s).
      if (remainingSeconds !== lastDisplayedSecondRef.current) {
        lastDisplayedSecondRef.current = remainingSeconds;
        setDisplayRemainingMs(remaining);
      }

      if (remaining <= 0) {
        // Timer reached zero — complete the session.
        rafIdRef.current = null;
        const sid = sessionIdRef.current;
        if (sid !== null) {
          const msg = COMPLETION_MESSAGES[completionIndexRef.current % COMPLETION_MESSAGES.length];
          completionIndexRef.current += 1;
          setCompletionMessage(msg);
          setPhase('done');
          completeFocusSession(sid)
            .then(({ points_awarded }) => {
              if (points_awarded > 0) onPointsEarned(points_awarded);
            })
            .catch((err: unknown) => {
              console.error('Failed to complete focus session:', err);
            });
          sessionIdRef.current = null;
        }
        return; // Do not re-schedule RAF.
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [onPointsEarned]);

  // Pause the timer when the window is hidden; resume when it returns.
  // This prevents the timer from counting time the user can't see it.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (phase === 'running') {
          stopRaf();
          pausedAtRef.current = performance.now();
        }
      } else {
        if (phase === 'running' && pausedAtRef.current !== null) {
          pausedDurationMsRef.current += performance.now() - pausedAtRef.current;
          pausedAtRef.current = null;
          startRaf();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [phase, startRaf, stopRaf]);

  // Abort any in-flight session on unmount.
  useEffect(() => {
    return () => {
      stopRaf();
      const sid = sessionIdRef.current;
      if (sid !== null) {
        abortFocusSession(sid).catch(() => {});
        sessionIdRef.current = null;
      }
    };
  }, [stopRaf]);

  const handleStart = useCallback(() => {
    const targetMs = targetMinutes * 60 * 1000;
    targetMsRef.current = targetMs;
    pausedDurationMsRef.current = 0;
    pausedAtRef.current = null;
    lastDisplayedSecondRef.current = -1;
    setDisplayRemainingMs(targetMs);

    startFocusSession(targetMinutes)
      .then((session) => {
        sessionIdRef.current = session.id;
        startedAtRef.current = performance.now();
        setPhase('running');
        startRaf();
      })
      .catch((err: unknown) => {
        console.error('Failed to start focus session:', err);
      });
  }, [targetMinutes, startRaf]);

  const handlePause = useCallback(() => {
    stopRaf();
    pausedAtRef.current = performance.now();
    setPhase('paused');
  }, [stopRaf]);

  const handleResume = useCallback(() => {
    if (pausedAtRef.current !== null) {
      pausedDurationMsRef.current += performance.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setPhase('running');
    startRaf();
  }, [startRaf]);

  const handleStop = useCallback(() => {
    stopRaf();
    const sid = sessionIdRef.current;
    if (sid !== null) {
      abortFocusSession(sid).catch((err: unknown) => {
        console.error('Failed to abort focus session:', err);
      });
      sessionIdRef.current = null;
    }
    setPhase('idle');
    setDisplayRemainingMs(targetMsRef.current);
  }, [stopRaf]);

  const handleDismissDone = useCallback(() => {
    setPhase('idle');
    setDisplayRemainingMs(targetMinutes * 60 * 1000);
  }, [targetMinutes]);

  const adjustDuration = useCallback(
    (delta: number) => {
      setTargetMinutes((prev) => {
        const next = Math.min(
          MAX_DURATION_MINUTES,
          Math.max(MIN_DURATION_MINUTES, prev + delta),
        );
        if (phase === 'idle') {
          setDisplayRemainingMs(next * 60 * 1000);
          targetMsRef.current = next * 60 * 1000;
        }
        return next;
      });
    },
    [phase],
  );

  const totalMs = phase === 'idle' ? targetMinutes * 60 * 1000 : targetMsRef.current;
  const progressFraction = totalMs > 0 ? 1 - displayRemainingMs / totalMs : 0;

  return (
    <div className="focus-timer">
      {phase === 'done' ? (
        <div className="focus-done" onClick={handleDismissDone} role="button" aria-label="Dismiss">
          <span className="focus-done-message">{completionMessage}</span>
        </div>
      ) : (
        <>
          <div className="focus-display">
            <span className="focus-time">{formatMs(displayRemainingMs)}</span>
            <div className="focus-progress-track">
              <div
                className="focus-progress-fill"
                style={{ width: `${(progressFraction * 100).toFixed(2)}%` }}
              />
            </div>
          </div>

          {phase === 'idle' && (
            <div className="focus-duration-row">
              <button
                className="focus-duration-btn"
                onClick={() => adjustDuration(-STEP_MINUTES)}
                disabled={targetMinutes <= MIN_DURATION_MINUTES}
                aria-label="Decrease duration"
              >
                −
              </button>
              <span className="focus-duration-label">{targetMinutes} min</span>
              <button
                className="focus-duration-btn"
                onClick={() => adjustDuration(STEP_MINUTES)}
                disabled={targetMinutes >= MAX_DURATION_MINUTES}
                aria-label="Increase duration"
              >
                +
              </button>
            </div>
          )}

          <div className="focus-controls">
            {phase === 'idle' && (
              <button className="focus-btn focus-btn--start" onClick={handleStart}>
                Start
              </button>
            )}
            {phase === 'running' && (
              <>
                <button className="focus-btn focus-btn--pause" onClick={handlePause}>
                  Pause
                </button>
                <button className="focus-btn focus-btn--stop" onClick={handleStop}>
                  Stop
                </button>
              </>
            )}
            {phase === 'paused' && (
              <>
                <button className="focus-btn focus-btn--start" onClick={handleResume}>
                  Resume
                </button>
                <button className="focus-btn focus-btn--stop" onClick={handleStop}>
                  Stop
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
