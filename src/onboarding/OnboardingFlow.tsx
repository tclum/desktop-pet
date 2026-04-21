import { useState } from 'react';
import StartScreen from './StartScreen';
import LearnMore from './LearnMore';
import EnvironmentSelect from './EnvironmentSelect';
import type { PetState } from '../pet/types';

type Step = 'start' | 'learn-more' | 'environment';

interface Props {
  /**
   * Fires once the user selects an environment and complete_onboarding
   * succeeds. The pet returned has has_completed_onboarding = true and
   * environment populated — handing it to App.tsx's setter is all that's
   * needed to switch the UI over to the main app.
   */
  onCompleted: (pet: PetState) => void;
}

/**
 * Three-step onboarding state machine. Each step unmounts the previous one,
 * so the 360ms fade-in defined on .onboarding-screen re-runs on every step
 * change — that's the "gentle cross-fade" between steps.
 */
export default function OnboardingFlow({ onCompleted }: Props) {
  const [step, setStep] = useState<Step>('start');

  if (step === 'start') {
    return (
      <StartScreen
        onStart={() => setStep('environment')}
        onLearnMore={() => setStep('learn-more')}
      />
    );
  }

  if (step === 'learn-more') {
    return <LearnMore onBack={() => setStep('start')} />;
  }

  return <EnvironmentSelect onCompleted={onCompleted} />;
}

/*
 * TODO(design): the "meeting your pet" beat should happen here —
 * ceremonial transition from environment selection to first view of the
 * pet. Awaiting design decisions. For now, completeOnboarding returns
 * the pet and App.tsx immediately renders the main experience.
 */
