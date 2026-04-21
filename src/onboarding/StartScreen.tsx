interface Props {
  onStart: () => void;
  onLearnMore: () => void;
}

/**
 * First screen a new user sees. The pre-pet shape is deliberately a warm
 * glow, not a full pet — per the brief, "the creature is already there in
 * some form" without committing to a look before the user has even chosen
 * their environment.
 *
 * Copy leans warm and low-pressure: the user is greeted, not pitched to.
 */
export default function StartScreen({ onStart, onLearnMore }: Props) {
  return (
    <div className="onboarding-screen onboarding-start">
      <div className="onboarding-prepet" aria-hidden="true">
        <div className="onboarding-prepet-glow" />
        <div className="onboarding-prepet-egg" />
      </div>

      <div className="onboarding-copy">
        <h1 className="onboarding-title">Hello, you.</h1>
        <p className="onboarding-subtitle">
          Someone&rsquo;s about to meet you.
        </p>
      </div>

      <div className="onboarding-actions">
        <button
          type="button"
          className="onboarding-btn onboarding-btn--primary"
          onClick={onStart}
          autoFocus
        >
          Start
        </button>
        <button
          type="button"
          className="onboarding-btn onboarding-btn--secondary"
          onClick={onLearnMore}
        >
          Learn more
        </button>
      </div>
    </div>
  );
}
