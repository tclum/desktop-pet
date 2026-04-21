interface Props {
  onBack: () => void;
}

/**
 * Structural placeholder — the four sections below are the shape the real
 * copy needs to hit, but the actual words are awaiting a copy pass. See the
 * TODO(copy) markers; keep the section identifiers stable so future copy
 * edits land cleanly.
 */
export default function LearnMore({ onBack }: Props) {
  return (
    <div className="onboarding-screen onboarding-learn-more">
      <div className="onboarding-learn-more-scroll">
        <h1 className="onboarding-title">What is this?</h1>

        <section className="learn-more-section" data-section="what-is-this">
          {/* TODO(copy): real learn-more content for the "What is this?" section.
              Placeholder below is structural only — replace before launch. */}
          <h2 className="learn-more-heading">What is this?</h2>
          <p className="learn-more-body">
            A small creature that lives on your desktop. It grows when you
            show up and do the things you said you&rsquo;d do.
          </p>
        </section>

        <section className="learn-more-section" data-section="how-it-works">
          {/* TODO(copy): real learn-more content for the "How does it work?" section. */}
          <h2 className="learn-more-heading">How does it work?</h2>
          <p className="learn-more-body">
            There&rsquo;s a to-do list and a focus timer built in. Finishing
            tasks and completing focus sessions helps your pet grow. Being
            here is enough; doing anything more is a bonus.
          </p>
        </section>

        <section className="learn-more-section" data-section="what-its-not">
          {/* TODO(copy): real learn-more content for the "What it's not" section.
              The non-negotiables from desktop-pet-design.md belong here —
              no death, no streaks, no guilt, no surveillance. */}
          <h2 className="learn-more-heading">What it&rsquo;s not</h2>
          <p className="learn-more-body">
            Your pet doesn&rsquo;t die. It doesn&rsquo;t punish you for being
            away. There are no streaks, no leaderboards, nothing measuring
            how hard you tried today.
          </p>
        </section>

        <section className="learn-more-section" data-section="privacy">
          {/* TODO(copy): real learn-more content for the "Privacy" section.
              Keep the commitment specific: local-only, no telemetry in v1. */}
          <h2 className="learn-more-heading">Privacy</h2>
          <p className="learn-more-body">
            Everything stays on your computer. The pet doesn&rsquo;t phone
            home. Your data is yours.
          </p>
        </section>
      </div>

      <div className="onboarding-actions">
        <button
          type="button"
          className="onboarding-btn onboarding-btn--secondary"
          onClick={onBack}
          autoFocus
        >
          Back
        </button>
      </div>
    </div>
  );
}
