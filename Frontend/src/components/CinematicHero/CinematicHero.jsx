import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ArrowDownRight } from 'lucide-react';
import './CinematicHero.css';

const INTRO_STORAGE_KEY = 'chips-and-bytes:welcome-seen';
const FRAME_DURATION_MS = 5200;

const heroFrames = [
  {
    src: '/assets/hero/zen2-matisse-die.webp',
    position: 'center',
    label: 'AMD Zen 2 Matisse die',
    kind: 'photo',
  },
  {
    src: '/assets/hero/silicon-wafer-closeup.webp',
    position: 'center',
    label: 'Silicon wafer close-up',
    kind: 'photo',
  },
  {
    src: '/assets/hero/nvidia-gp100-die.webp',
    position: 'center',
    label: 'NVIDIA GP100 die',
    kind: 'photo',
  },
  {
    src: '/assets/hero/processor-grid-macro.webp',
    position: 'center',
    label: 'Processor grid macro',
    kind: 'photo',
  },
  {
    src: '/assets/hero/intel-i9-13900k-die.webp',
    position: 'center',
    label: 'Intel Core i9-13900K labelled die',
    kind: 'photo',
  },
  {
    src: '/assets/hero/circuit-board-macro.webp',
    position: 'center 58%',
    label: 'Circuit board macro',
    kind: 'photo',
  },
  {
    src: '/assets/hero/amd-epyc-rome-io-die.webp',
    position: 'center',
    label: 'AMD EPYC Rome IO die',
    kind: 'photo',
  },
  {
    src: '/assets/hero/golden-processor-die.webp',
    position: 'center',
    label: 'Golden processor die',
    kind: 'photo',
  },
  {
    src: '/assets/hero/exposed-processor-die.webp',
    position: 'center',
    label: 'Exposed processor die',
    kind: 'photo',
  },
  {
    src: '/assets/hero/blue-processor-die.webp',
    position: 'center',
    label: 'Blue processor die',
    kind: 'photo',
  },
  {
    src: '/assets/hero/development-board-top.webp',
    position: 'center 54%',
    label: 'Development board top view',
    kind: 'photo',
  },
  {
    src: '/assets/hero/orange-processor-die.webp',
    position: 'center',
    label: 'Orange processor die',
    kind: 'photo',
  },
  {
    src: '/assets/hero/silicon-wafer-macro-secondary.webp',
    position: 'center',
    label: 'Silicon wafer macro',
    kind: 'photo',
  },
  {
    src: '/assets/hero/angled-rainbow-die.webp',
    position: 'center',
    label: 'Angled rainbow processor die',
    kind: 'photo',
  },
  {
    src: '/assets/hero/wafer-die-pattern.webp',
    position: 'center 42%',
    label: 'Silicon wafer die pattern',
    kind: 'photo',
  },
];

const REEL_DURATION_SECONDS = (heroFrames.length * FRAME_DURATION_MS) / 1000;

const shouldShowWelcome = () => {
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
};

const CinematicHero = ({ onJoin }) => {
  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome);

  useLayoutEffect(() => {
    const bootstrap = document.getElementById('welcome-bootstrap');
    document.documentElement.classList.add('welcome-app-ready');

    if (!bootstrap) return undefined;

    const handoff = () => {
      bootstrap.classList.add('is-handoff');
      window.setTimeout(() => bootstrap.remove(), 220);
    };
    const frame = window.requestAnimationFrame?.(handoff) ?? window.setTimeout(handoff, 0);

    return () => {
      if (window.cancelAnimationFrame) window.cancelAnimationFrame(frame);
      else window.clearTimeout(frame);
    };
  }, []);

  useEffect(() => {
    if (!showWelcome) return undefined;

    document.body.classList.add('welcome-is-playing');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
      } catch {
        // The welcome remains functional when browser storage is unavailable.
      }
      document.body.classList.remove('welcome-is-playing');
      setShowWelcome(false);
    }, reducedMotion ? 900 : 2900);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove('welcome-is-playing');
    };
  }, [showWelcome]);

  return (
    <>
      {showWelcome && (
        <div className="welcome-sequence" role="status" aria-label="Welcome to Chips and Bytes">
          <p>Welcome to</p>
          <h1>Chips <span>&amp;</span> Bytes</h1>
          <div className="welcome-sequence__index" aria-hidden="true">
            <span>SSSIHL</span>
            <span>Computer Architecture Club</span>
          </div>
        </div>
      )}

      <section className="cinematic-hero" aria-labelledby="hero-title">
        <div className="cinematic-reel" aria-hidden="true">
          {heroFrames.map((frame, index) => (
            <figure
              className={`cinematic-frame cinematic-frame--${frame.kind}`}
              key={frame.src}
              style={{
                '--frame-delay': `${index * (FRAME_DURATION_MS / 1000)}s`,
                '--reel-duration': `${REEL_DURATION_SECONDS}s`,
                '--drift-delay': `${index * -1.7}s`,
              }}
            >
              <img
                src={frame.src}
                alt=""
                style={{ objectPosition: frame.position }}
                loading={index < 3 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            </figure>
          ))}
        </div>

        <div className="cinematic-hero__shade" aria-hidden="true" />
        <div className="cinematic-hero__copy">
          <p className="cinematic-hero__eyebrow">Chips &amp; Bytes · Computer Architecture Club</p>
          <h1 id="hero-title">
            Explore the world of <em>Computer Architecture</em>
          </h1>
          <button className="cinematic-hero__action" onClick={onJoin}>
            <span>Join Our Community</span>
            <ArrowDownRight size={19} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>

      </section>
    </>
  );
};

export default CinematicHero;
