import { useState, useEffect, useCallback } from 'react';
import {
  isPermissionGranted,
  requestPermission,
} from '@tauri-apps/plugin-notification';
import { getCurrentWindow } from '@tauri-apps/api/window';
import PetView from './pet/PetView';
import type { PetState } from './pet/types';
import {
  getPet,
  isNotificationPermissionNeeded,
  markNotificationPermissionAsked,
} from './lib/tauri';
import './styles/pet.css';

export default function App() {
  const [petState, setPetState] = useState<PetState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getPet()
      .then(setPetState)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Failed to load pet:', msg);
        setLoadError(msg);
      });

    void setupNotificationPermission();
  }, []);

  const handlePetStateUpdate = useCallback((updated: PetState) => {
    setPetState(updated);
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
      <PetView petState={petState} onPetStateUpdate={handlePetStateUpdate} />
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
