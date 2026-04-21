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
import type { PetState } from './pet/types';
import {
  getPet,
  isNotificationPermissionNeeded,
  markNotificationPermissionAsked,
  getWindowPosition,
  setWindowPosition,
} from './lib/tauri';

import './styles/pet.css';
import './styles/productivity.css';

export default function App() {
  const [petState, setPetState] = useState<PetState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Signals the pet to play its reaction glow when productivity points are earned.
  const triggerPetReactionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    getPet()
      .then(setPetState)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Failed to load pet:', msg);
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

  const handleRegisterPetReaction = useCallback((trigger: () => void) => {
    triggerPetReactionRef.current = trigger;
  }, []);

  const handlePointsEarned = useCallback((_points: number) => {
    triggerPetReactionRef.current?.();
  }, []);

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
        <p>Something went wrong loading your pet.</p>
        <p style={{ fontSize: '11px', opacity: 0.6, marginTop: 8 }}>{loadError}</p>
      </div>
    );
  }

  if (!petState) {
    return <div className="pet-window" />;
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
