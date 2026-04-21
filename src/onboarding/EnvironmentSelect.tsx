import { useCallback, useRef, useState } from 'react';
import type { Environment } from '../pet/types';
import { completeOnboarding } from '../lib/tauri';
import type { PetState } from '../pet/types';

interface Props {
  onCompleted: (pet: PetState) => void;
}

interface EnvironmentOption {
  id: Environment;
  label: string;
  flavor: string;
}

/**
 * v1 environments — identifiers and user-facing labels are kept here and
 * the DB CHECK constraint (see migrate_7_to_8). The flavor text is
 * intentionally short — one hint, not a description — and matches the
 * warm tones in the design doc's § Environments as Cosmetic Skins table.
 */
const ENVIRONMENTS: readonly EnvironmentOption[] = [
  { id: 'forest',      label: 'Forest',      flavor: 'Cozy, mossy, sheltered.' },
  { id: 'countryside', label: 'Countryside', flavor: 'Warm, open, domestic.' },
  { id: 'mountain',    label: 'Mountain',    flavor: 'High, wild, elemental.' },
  { id: 'ocean',       label: 'Ocean',       flavor: 'Deep, vast, watchful.' },
  { id: 'city',        label: 'City',        flavor: 'Alert, urban, awake.' },
] as const;

export default function EnvironmentSelect({ onCompleted }: Props) {
  const [selected, setSelected] = useState<Environment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      // Roving-tabindex arrow navigation (WAI-ARIA radio-group pattern).
      // Left/Up = previous; Right/Down = next; wraps in both directions.
      const last = ENVIRONMENTS.length - 1;
      let next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = index === last ? 0 : index + 1;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = index === 0 ? last : index - 1;
      } else if (e.key === 'Home') {
        next = 0;
      } else if (e.key === 'End') {
        next = last;
      }
      if (next >= 0) {
        e.preventDefault();
        const target = cardRefs.current[next];
        const nextEnv = ENVIRONMENTS[next];
        if (target && nextEnv) {
          target.focus();
          setSelected(nextEnv.id);
        }
      }
    },
    [],
  );

  const handleContinue = useCallback(() => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError(null);
    completeOnboarding(selected)
      .then((pet) => {
        onCompleted(pet);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('complete_onboarding failed:', msg);
        setError(msg);
        setSubmitting(false);
      });
  }, [selected, submitting, onCompleted]);

  return (
    <div className="onboarding-screen onboarding-env">
      <div className="onboarding-copy">
        <h1 className="onboarding-title">Where will they live?</h1>
        <p className="onboarding-subtitle">
          Pick a home for your pet. This shapes how things look &mdash; not
          who they become.
        </p>
      </div>

      <div
        className="env-grid"
        role="radiogroup"
        aria-label="Choose an environment"
      >
        {ENVIRONMENTS.map((env, i) => {
          const isSelected = selected === env.id;
          // Roving tabindex: the selected card (or the first one if nothing
          // is selected yet) is the single Tab stop in the group.
          const isTabStop = isSelected || (selected === null && i === 0);
          return (
            <button
              key={env.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isTabStop ? 0 : -1}
              className={`env-card env-card--${env.id}${
                isSelected ? ' env-card--selected' : ''
              }`}
              onClick={() => setSelected(env.id)}
              onKeyDown={(e) => handleCardKeyDown(e, i)}
            >
              <span className="env-card-visual" aria-hidden="true" />
              <span className="env-card-label">{env.label}</span>
              <span className="env-card-flavor">{env.flavor}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="onboarding-error" role="alert">
          Something got in the way of saving your choice. Try again in a
          moment.
        </p>
      )}

      <div className="onboarding-actions">
        <button
          type="button"
          className="onboarding-btn onboarding-btn--primary"
          onClick={handleContinue}
          disabled={!selected || submitting}
          aria-disabled={!selected || submitting}
        >
          {submitting ? 'Settling in…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
