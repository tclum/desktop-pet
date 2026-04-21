import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isPermissionGranted,
  requestPermission,
} from '@tauri-apps/plugin-notification';
import { getCurrentWindow, availableMonitors } from '@tauri-apps/api/window';
import { PhysicalPosition } from '@tauri-apps/api/dpi';
import PetView from './pet/PetView';
import ProductivityPanel from './productivity/ProductivityPanel';
import DebugPanel from './debug/DebugPanel';
import OnboardingFlow from './onboarding/OnboardingFlow';
import type { PetState } from './pet/types';
import type { ReactionKind } from './pet/PetView';
import type { GreetingTier } from './lib/tauri';
import {
  getPet,
  isNotificationPermissionNeeded,
  markNotificationPermissionAsked,
  getWindowPosition,
  setWindowPosition,
  startSession,
} from './lib/tauri';

import './styles/pet.css';
import './styles/productivity.css';
import './styles/onboarding.css';

export default function App() {
  const [petState, setPetState] = useState<PetState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Signals the pet to play its reaction glow when productivity points are earned.
  const triggerPetReactionRef = useRef<((kind: ReactionKind) => void) | null>(null);
  // Signals the pet to play its tier-specific welcome-back animation.
  const triggerPetGreetingRef = useRef<((tier: GreetingTier) => void) | null>(null);
  // Pending greeting tier, held until PetView registers its trigger — the
  // backend call may resolve before the RAF loop is ready to receive.
  const pendingGreetingRef = useRef<GreetingTier | null>(null);

  useEffect(() => {
    // One atomic call: computes greeting tier against the pre-bump timestamp,
    // bumps last_interaction_at so the pet returns with a cleared resting
    // state, and hands back both. Replaces the earlier getPet + checkGreeting
    // pair which had a race where the tier could be computed after the bump.
    startSession()
      .then(({ tier, pet }) => {
        setPetState(pet);
        if (tier === 'none') return;
        const fire = triggerPetGreetingRef.current;
        if (fire) fire(tier);
        else pendingGreetingRef.current = tier;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Failed to start session:', msg);
        setLoadError(msg);
      });

    void setupNotificationPermission();
    const dragTeardown = setupWindowDragPersistence();
    return () => {
      void dragTeardown.then((fn) => fn());
    };
  }, []);

  const handlePetStateUpdate = useCallback((updated: PetState) => {
    setPetState(updated);
  }, []);

  const handleRegisterPetReaction = useCallback(
    (trigger: (kind: ReactionKind) => void) => {
      triggerPetReactionRef.current = trigger;
    },
    [],
  );

  const handleRegisterPetGreeting = useCallback(
    (trigger: (tier: GreetingTier) => void) => {
      triggerPetGreetingRef.current = trigger;
      const pending = pendingGreetingRef.current;
      if (pending !== null) {
        pendingGreetingRef.current = null;
        trigger(pending);
      }
    },
    [],
  );

  const handlePointsEarned = useCallback(
    (_points: number, kind: ReactionKind) => {
      triggerPetReactionRef.current?.(kind);
    },
    [],
  );

  // Called when a productivity command returns evolved: true.
  // Re-fetches the pet so PetView detects the stage change and starts the transition.
  const handleEvolution = useCallback(() => {
    getPet()
      .then(setPetState)
      .catch((err: unknown) => {
        console.error('Failed to reload pet after evolution:', err);
      });
  }, []);

  if (loadError) {
    return (
      <div className="pet-window pet-error">
        <p>Something got in the way of loading your pet.</p>
        <p style={{ fontSize: '12px', opacity: 0.7, marginTop: 6 }}>
          Your save is still safe. Try restarting the app.
        </p>
        <p style={{ fontSize: '11px', opacity: 0.45, marginTop: 12 }}>{loadError}</p>
      </div>
    );
  }

  if (!petState) {
    // Subtle "still waking up" state. Almost-invisible on purpose — the DB
    // usually returns in milliseconds, so this is only visible on slow
    // first-launch or if the backend is under load. Avoids the blank flash.
    return (
      <div className="pet-window pet-loading">
        <span className="pet-loading-dot" aria-hidden="true" />
        <span className="pet-loading-sr">loading your pet</span>
      </div>
    );
  }

  // First-launch flow: user hasn't picked an environment yet. The debug
  // panel remains mounted so the founder can escape hatch out of onboarding
  // mid-flow during demos. No drag handle here — the window is already
  // drag-enabled via the tauri config; a visible handle would compete with
  // the onboarding's vertical centering.
  if (!petState.has_completed_onboarding) {
    return (
      <div className="pet-window pet-window--onboarding">
        <OnboardingFlow onCompleted={handlePetStateUpdate} />
        <DebugPanel onPetStateUpdate={handlePetStateUpdate} onEvolution={handleEvolution} />
      </div>
    );
  }

  return (
    <div className="pet-window">
      <div className="drag-zone">
        <div className="drag-handle" data-tauri-drag-region aria-label="Drag to move window">
          <span className="drag-handle-dot" />
          <span className="drag-handle-dot" />
          <span className="drag-handle-dot" />
        </div>
      </div>
      <div className="pet-area">
        <PetView
          petState={petState}
          onPetStateUpdate={handlePetStateUpdate}
          onRegisterReactionTrigger={handleRegisterPetReaction}
          onRegisterGreetingTrigger={handleRegisterPetGreeting}
        />
      </div>
      <div className="panel-area">
        <ProductivityPanel onPointsEarned={handlePointsEarned} onEvolution={handleEvolution} />
      </div>
      <DebugPanel onPetStateUpdate={handlePetStateUpdate} onEvolution={handleEvolution} />
    </div>
  );
}

/**
 * Asks for notification permission the first time the window is focused.
 * Uses Tauri's onFocusChanged event instead of document.visibilitychange —
 * WKWebView does not reliably fire visibilitychange when a Tauri window is
 * programmatically shown via window.show(), since that's a native NSWindow
 * operation rather than a browser tab switch.
 */
async function setupNotificationPermission() {
  try {
    const needed = await isNotificationPermissionNeeded();
    if (!needed) return;

    const ask = async () => {
      const already = await isPermissionGranted();
      if (!already) {
        await requestPermission();
        // Mark only after requestPermission() has returned a result from the
        // OS dialog — never before, never in a catch/finally, never when we
        // skipped the request because permission was already granted.
        await markNotificationPermissionAsked();
      }
    };

    const win = getCurrentWindow();
    const alreadyFocused = await win.isFocused();

    if (alreadyFocused) {
      await ask();
    } else {
      // Wait for first focus — fires when user clicks the tray icon and
      // toggle_pet_window calls window.show() + window.set_focus().
      const unlisten = await win.onFocusChanged(async ({ payload: focused }) => {
        if (focused) {
          unlisten();
          await ask();
        }
      });
    }
  } catch (err) {
    console.error('notification permission setup failed:', err);
  }
}

/**
 * Restores the last-known window position (if still on a valid monitor) and
 * subscribes to onMoved to persist new positions after the user drags. The
 * save is trailing-debounced so SQLite sees one write per drag gesture, not
 * one per pixel.
 */
function setupWindowDragPersistence(): Promise<() => void> {
  const SAVE_DEBOUNCE_MS = 400;
  const MARGIN_PX = 40;

  return (async () => {
    const win = getCurrentWindow();

    try {
      const saved = await getWindowPosition();
      if (saved) {
        const monitors = await availableMonitors();
        // A window is considered on-screen if its top-left lies inside any
        // monitor's rect with a small inset — this rules out positions where
        // only a sliver of the title area is visible.
        const onScreen = monitors.some((m) => {
          const left = m.position.x;
          const top = m.position.y;
          const right = left + m.size.width;
          const bottom = top + m.size.height;
          return (
            saved.x >= left + MARGIN_PX &&
            saved.y >= top + MARGIN_PX &&
            saved.x <= right - MARGIN_PX &&
            saved.y <= bottom - MARGIN_PX
          );
        });
        if (onScreen) {
          await win.setPosition(new PhysicalPosition(saved.x, saved.y));
        }
      }
    } catch (err) {
      console.error('failed to restore window position:', err);
    }

    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    const unlisten = await win.onMoved(({ payload }) => {
      if (saveTimer !== null) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = null;
        setWindowPosition(payload.x, payload.y).catch((err) => {
          console.error('failed to save window position:', err);
        });
      }, SAVE_DEBOUNCE_MS);
    });

    return () => {
      if (saveTimer !== null) clearTimeout(saveTimer);
      unlisten();
    };
  })();
}
