import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import type { CSSProperties } from 'react';

export const design: DesignSystem = {
  palette: { bg: '#0c0c0d', text: '#f3f1ea', accent: '#d6d2c4' },
  fonts: {
    display: 'ui-serif, Georgia, "Times New Roman", serif',
    body: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  },
  typeScale: { hero: 168, body: 34 },
  radius: 6,
};

const muted = 'rgba(243, 241, 234, 0.42)';
const hairline = 'rgba(243, 241, 234, 0.10)';

const fill = {
  width: '100%',
  height: '100%',
  fontFamily: 'var(--osd-font-body)',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
} as const;

const EYEBROW: CSSProperties = {
  fontSize: 20,
  letterSpacing: '0.28em',
  color: 'var(--osd-accent)',
  textTransform: 'uppercase',
  fontWeight: 500,
};

const FOOT: CSSProperties = {
  fontSize: 18,
  letterSpacing: '0.22em',
  color: muted,
  textTransform: 'uppercase',
  fontVariantNumeric: 'tabular-nums',
};

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      padding: '120px 144px',
    }}
  >
    <div style={EYEBROW}>open-slide · field notes</div>
    <div style={{ alignSelf: 'center' }}>
      <h1
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 'var(--osd-size-hero)',
          fontWeight: 400,
          lineHeight: 0.96,
          letterSpacing: '-0.035em',
          margin: 0,
        }}
      >
        On tasteful
        <br />
        transitions.
      </h1>
      <p
        style={{
          fontSize: 32,
          lineHeight: 1.5,
          color: muted,
          marginTop: 48,
          maxWidth: 980,
          fontStyle: 'italic',
        }}
      >
        Six pages, one transition, almost no motion.
      </p>
    </div>
    <div style={{ ...FOOT, display: 'flex', justifyContent: 'space-between' }}>
      <span>01</span>
      <span>arrow keys ⇆</span>
    </div>
  </div>
);

const Lesson = ({
  n,
  heading,
  body,
  pull,
}: {
  n: string;
  heading: string;
  body: string;
  pull: string;
}) => (
  <div
    style={{
      ...fill,
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      padding: '120px 144px',
    }}
  >
    <div style={EYEBROW}>{`§ ${n}`}</div>
    <div
      style={{
        alignSelf: 'center',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: 120,
        alignItems: 'start',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 92,
          fontWeight: 400,
          lineHeight: 1.02,
          letterSpacing: '-0.025em',
          margin: 0,
        }}
      >
        {heading}
      </h2>
      <div>
        <p
          style={{
            fontSize: 36,
            lineHeight: 1.45,
            color: 'var(--osd-text)',
            margin: 0,
            fontFamily: 'var(--osd-font-display)',
            fontStyle: 'italic',
          }}
        >
          “{pull}”
        </p>
        <p
          style={{
            fontSize: 26,
            lineHeight: 1.6,
            color: muted,
            marginTop: 56,
            borderTop: `1px solid ${hairline}`,
            paddingTop: 32,
          }}
        >
          {body}
        </p>
      </div>
    </div>
    <div style={{ ...FOOT, display: 'flex', justifyContent: 'space-between' }}>
      <span>{n}</span>
      <span>house transition · quiet</span>
    </div>
  </div>
);

const OneCurve: Page = () => (
  <Lesson
    n="02"
    heading={'Pick one\ntransition.'}
    pull="Variety is the loudest signal of made-in-PowerPoint."
    body="Refined decks use a single house transition across every slide. The reader stops noticing it after page two — which is exactly the point. Motion that announces itself is motion that interrupts."
  />
);

const ShortDurations: Page = () => (
  <Lesson
    n="03"
    heading={'Two hundred\nmilliseconds.'}
    pull="If you can feel the duration, it's already too long."
    body="A slide change happens in 140 ms of exit and 200 ms of enter, overlapped. Anything past 350 ms drifts into video-editor territory — meaningful only when something large is genuinely transforming on screen."
  />
);

const Pause: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 144,
      textAlign: 'center',
    }}
  >
    <div style={{ ...EYEBROW, marginBottom: 72 }}>§ intermission</div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 200,
        fontWeight: 400,
        lineHeight: 0.95,
        letterSpacing: '-0.04em',
        margin: 0,
      }}
    >
      Restraint.
    </h2>
    <p
      style={{
        fontSize: 28,
        lineHeight: 1.5,
        color: muted,
        marginTop: 64,
        maxWidth: 800,
        fontStyle: 'italic',
      }}
    >
      A chapter deserves a breath. One reserved transition, used twice in a deck.
    </p>
  </div>
);

const SmallMagnitudes: Page = () => (
  <Lesson
    n="05"
    heading={'Six pixels,\nnot nineteen-twenty.'}
    pull="The brain reads small motion as continuity, large motion as rupture."
    body="A six-pixel rise reads as the next thought. A full-width translate reads as a different document. Premium tools move things barely enough to be perceived — opacity 0 to 1, plus a hair of vertical drift, and nothing else."
  />
);

const Closing: Page = () => (
  <div
    style={{
      ...fill,
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      padding: '120px 144px',
    }}
  >
    <div style={EYEBROW}>fin</div>
    <div style={{ alignSelf: 'center', maxWidth: 1400 }}>
      <h2
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 140,
          fontWeight: 400,
          lineHeight: 0.98,
          letterSpacing: '-0.03em',
          margin: 0,
        }}
      >
        Good motion is
        <br />
        <em style={{ fontStyle: 'italic' }}>invisible</em>.
      </h2>
      <p
        style={{
          fontSize: 26,
          lineHeight: 1.6,
          color: muted,
          marginTop: 56,
          maxWidth: 920,
          borderTop: `1px solid ${hairline}`,
          paddingTop: 32,
        }}
      >
        The framework gives you the canvas and the lifecycle. Pick one quiet transition, and let the
        writing carry the deck.
      </p>
    </div>
    <div style={{ ...FOOT, display: 'flex', justifyContent: 'space-between' }}>
      <span>06 / 06</span>
      <span>← to revisit</span>
    </div>
  </div>
);

// House transition — applied to every page that doesn't override.
// Out-then-in with overlap: exit starts immediately, enter delays 80ms.
// Tiny rise (4-6px), short durations, asymmetric easing per direction.
export const transition: SlideTransition = {
  duration: 200,
  easing: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: {
    duration: 140,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-4px)' },
    ],
  },
  enter: {
    duration: 200,
    delay: 80,
    keyframes: [
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

// Cover variant — slightly more generous rise + a touch of blur on enter only.
// Reserved for hero/title pages.
Cover.transition = {
  duration: 280,
  easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  exit: {
    duration: 160,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-6px)' },
    ],
  },
  enter: {
    duration: 280,
    delay: 100,
    keyframes: [
      { opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
    ],
  },
};

// Section-break variant — exit fully, hold for a beat, then enter.
// Reserved for genuine chapter changes. Used once in this deck.
Pause.transition = {
  duration: 460,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  exit: {
    duration: 180,
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
  },
  enter: {
    duration: 240,
    delay: 300,
    keyframes: [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

export const meta: SlideMeta = {
  title: 'On Tasteful Transitions',
  createdAt: '2026-05-20T06:12:31.353Z',
};

export default [Cover, OneCurve, ShortDurations, Pause, SmallMagnitudes, Closing] satisfies Page[];
