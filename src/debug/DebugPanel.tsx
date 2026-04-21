import { useCallback, useEffect, useState } from 'react';
import type { PetState } from '../pet/types';
import {
  debugResetPet,
  debugAddGrowth,
  debugForceEvolveStage1,
  evolveToHatchling,
} from '../lib/tauri';

interface Props {
  onPetStateUpdate: (pet: PetState) => void;
  onEvolution: () => void;
}

/**
 * Hidden demo controls. Toggled with Cmd/Ctrl+Shift+D. Lives on top of the
 * window with a high z-index so it's reachable during any state (including
 * evolution transitions). Kept deliberately ugly — it's a founder tool, not
 * part of the product surface.
 */
export default function DebugPanel({ onPetStateUpdate, onEvolution }: Props) {
  const [visible, setVisible] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setVisible((v) => !v);
        return;
      }
      // Escape closes the panel if it's open — standard modal affordance.
      // Only acts when visible so Escape doesn't disrupt text inputs when
      // the panel is hidden.
      if (e.key === 'Escape') {
        setVisible((v) => {
          if (v) {
            e.preventDefault();
            return false;
          }
          return v;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleReset = useCallback(() => {
    debugResetPet()
      .then((pet) => {
        onPetStateUpdate(pet);
        setLastAction('reset to starter');
      })
      .catch((err: unknown) => {
        console.error('debug reset failed:', err);
      });
  }, [onPetStateUpdate]);

  const handleAddGrowth = useCallback(
    (delta: number) => {
      debugAddGrowth(delta)
        .then(({ evolved, pet }) => {
          onPetStateUpdate(pet);
          setLastAction(`+${delta} growth${evolved ? ' → evolved' : ''}`);
          if (evolved) onEvolution();
        })
        .catch((err: unknown) => {
          console.error('debug add growth failed:', err);
        });
    },
    [onPetStateUpdate, onEvolution],
  );

  const handleForceHatch = useCallback(() => {
    evolveToHatchling()
      .then((pet) => {
        onPetStateUpdate(pet);
        setLastAction('force → hatchling');
        onEvolution();
      })
      .catch((err: unknown) => {
        console.error('force evolve failed:', err);
      });
  }, [onPetStateUpdate, onEvolution]);

  const handleForceStage1 = useCallback(
    (personality: 'cuddly' | 'powerful') => {
      debugForceEvolveStage1(personality)
        .then((pet) => {
          onPetStateUpdate(pet);
          setLastAction(`force → stage1 ${personality}`);
          onEvolution();
        })
        .catch((err: unknown) => {
          console.error('force stage1 failed:', err);
        });
    },
    [onPetStateUpdate, onEvolution],
  );

  if (!visible) return null;

  return (
    <div className="debug-panel" role="dialog" aria-label="Debug panel">
      <div className="debug-panel-header">
        <span>debug</span>
        <button
          className="debug-panel-close"
          onClick={() => setVisible(false)}
          aria-label="Close debug panel"
        >
          ×
        </button>
      </div>
      <div className="debug-panel-actions">
        <button onClick={handleReset}>reset to starter</button>
        <button onClick={() => handleAddGrowth(1)}>+1 growth</button>
        <button onClick={() => handleAddGrowth(5)}>+5 growth</button>
        <button onClick={handleForceHatch}>force → hatchling</button>
        <button onClick={() => handleForceStage1('cuddly')}>force → stage1 cuddly</button>
        <button onClick={() => handleForceStage1('powerful')}>force → stage1 powerful</button>
      </div>
      {lastAction && <div className="debug-panel-status">{lastAction}</div>}
      <div className="debug-panel-hint">⌘⇧D to close</div>
    </div>
  );
}
