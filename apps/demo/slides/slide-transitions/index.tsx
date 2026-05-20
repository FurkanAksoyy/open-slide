import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import type { ReactNode } from 'react';

export const design: DesignSystem = {
  palette: { bg: '#0b0b0c', text: '#f5f4ef', accent: '#ffd66e' },
  fonts: {
    display: 'ui-serif, Georgia, "Times New Roman", serif',
    body: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  },
  typeScale: { hero: 176, body: 36 },
  radius: 8,
};

const muted = '#8a8a86';
const hairline = 'rgba(245, 244, 239, 0.12)';

const fill = {
  width: '100%',
  height: '100%',
  fontFamily: 'var(--osd-font-body)',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
} as const;

const Frame = ({
  eyebrow,
  title,
  caption,
  swatch,
}: {
  eyebrow: string;
  title: string;
  caption: string;
  swatch: ReactNode;
}) => (
  <div
    style={{
      ...fill,
      display: 'grid',
      gridTemplateColumns: '1fr 720px',
      gap: 96,
      padding: '128px 144px',
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div
        style={{
          fontSize: 22,
          letterSpacing: '0.32em',
          color: 'var(--osd-accent)',
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </div>
      <div>
        <h1
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 132,
            fontWeight: 500,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 32,
            lineHeight: 1.5,
            color: muted,
            marginTop: 40,
            maxWidth: 720,
          }}
        >
          {caption}
        </p>
      </div>
      <div
        style={{
          fontSize: 22,
          letterSpacing: '0.18em',
          color: muted,
          textTransform: 'uppercase',
        }}
      >
        Arrow keys ⇆ to navigate
      </div>
    </div>
    <div
      style={{
        position: 'relative',
        borderLeft: `1px solid ${hairline}`,
        paddingLeft: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {swatch}
    </div>
  </div>
);

const SwatchBox = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: 520,
      height: 520,
      borderRadius: 'var(--osd-radius)',
      border: `1px solid ${hairline}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '128px 144px',
    }}
  >
    <div
      style={{
        fontSize: 22,
        letterSpacing: '0.32em',
        color: 'var(--osd-accent)',
        textTransform: 'uppercase',
      }}
    >
      open-slide · demo
    </div>
    <div>
      <h1
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 'var(--osd-size-hero)',
          fontWeight: 500,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          margin: 0,
        }}
      >
        Slide
        <br />
        Transitions.
      </h1>
      <p
        style={{
          fontSize: 36,
          lineHeight: 1.45,
          color: muted,
          marginTop: 56,
          maxWidth: 1120,
        }}
      >
        Each page declares its own enter / exit animation. The framework owns the lifecycle; the
        page owns the look. Arrow → to begin.
      </p>
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 22,
        letterSpacing: '0.18em',
        color: muted,
        textTransform: 'uppercase',
      }}
    >
      <span>page 01</span>
      <span>module default · fade</span>
    </div>
  </div>
);

const SlideRight: Page = () => (
  <Frame
    eyebrow="page 02 · slide-from-side"
    title={'Translate\nfrom the edge.'}
    caption="Forward enters from the right, backward from the left — the same definition mirrors via the --osd-dir CSS variable."
    swatch={
      <SwatchBox>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,214,110,0.18), rgba(255,214,110,0) 60%)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 220,
            color: 'var(--osd-accent)',
            letterSpacing: '-0.04em',
          }}
        >
          →
        </span>
      </SwatchBox>
    }
  />
);

SlideRight.transition = {
  duration: 520,
  easing: 'cubic-bezier(.22, 1, .36, 1)',
  enter: {
    keyframes: [
      { transform: 'translateX(calc(var(--osd-dir, 1) * 100%))', opacity: 0.6 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
  },
  exit: {
    keyframes: [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(calc(var(--osd-dir, 1) * -28%))', opacity: 0 },
    ],
  },
};

const ScalePop: Page = () => (
  <Frame
    eyebrow="page 03 · scale-pop"
    title={'Scale and\nsoften in.'}
    caption="Incoming page grows from 88% with a slight blur falloff. Outgoing page lifts away."
    swatch={
      <SwatchBox>
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'var(--osd-accent)',
          }}
        />
      </SwatchBox>
    }
  />
);

ScalePop.transition = {
  duration: 460,
  easing: 'cubic-bezier(.16, 1, .3, 1)',
  enter: {
    keyframes: [
      { transform: 'scale(0.88)', filter: 'blur(8px)', opacity: 0 },
      { transform: 'scale(1)', filter: 'blur(0)', opacity: 1 },
    ],
  },
  exit: {
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.06)', opacity: 0 },
    ],
  },
};

const ClipWipe: Page = () => (
  <Frame
    eyebrow="page 04 · clip-wipe"
    title={'Reveal under\na moving edge.'}
    caption="An inset clip-path wipes the incoming page in from a single edge — direction-aware."
    swatch={
      <SwatchBox>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(90deg, var(--osd-text) 0 2px, transparent 2px 96px)',
            opacity: 0.5,
          }}
        />
      </SwatchBox>
    }
  />
);

ClipWipe.transition = {
  duration: 560,
  easing: 'cubic-bezier(.65, 0, .35, 1)',
  enter: {
    keyframes: [
      {
        clipPath:
          'inset(0 calc(50% - var(--osd-dir, 1) * 50%) 0 calc(50% + var(--osd-dir, 1) * 50%))',
      },
      { clipPath: 'inset(0 0 0 0)' },
    ],
  },
  exit: {
    keyframes: [{ opacity: 1 }, { opacity: 0.4 }],
  },
};

const BlurCross: Page = () => (
  <Frame
    eyebrow="page 05 · blur-cross"
    title={'Cross-fade\nthrough blur.'}
    caption="Both layers run in parallel. Outgoing page blurs and fades; incoming page sharpens in."
    swatch={
      <SwatchBox>
        <div
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 380,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: 'var(--osd-text)',
          }}
        >
          ✦
        </div>
      </SwatchBox>
    }
  />
);

BlurCross.transition = {
  duration: 540,
  easing: 'cubic-bezier(.4, 0, .2, 1)',
  enter: {
    keyframes: [
      { filter: 'blur(24px)', opacity: 0 },
      { filter: 'blur(0)', opacity: 1 },
    ],
  },
  exit: {
    keyframes: [
      { filter: 'blur(0)', opacity: 1 },
      { filter: 'blur(24px)', opacity: 0 },
    ],
  },
};

const End: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '0 200px',
    }}
  >
    <div
      style={{
        fontSize: 22,
        letterSpacing: '0.32em',
        color: 'var(--osd-accent)',
        textTransform: 'uppercase',
        marginBottom: 56,
      }}
    >
      page 06 · back to default fade
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 160,
        fontWeight: 500,
        lineHeight: 0.98,
        letterSpacing: '-0.03em',
        margin: 0,
        maxWidth: 1400,
      }}
    >
      Author owns the look.
      <br />
      Framework owns the rest.
    </h1>
    <p
      style={{
        fontSize: 32,
        lineHeight: 1.5,
        color: muted,
        marginTop: 56,
        maxWidth: 1200,
      }}
    >
      Per-page <code style={{ color: 'var(--osd-text)' }}>Page.transition</code> overrides the
      module-level default. Anything WAAPI can animate, you can animate.
    </p>
  </div>
);

export const transition: SlideTransition = {
  duration: 280,
  easing: 'cubic-bezier(.4, 0, .2, 1)',
  enter: { keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  exit: { keyframes: [{ opacity: 1 }, { opacity: 0 }] },
};

export const meta: SlideMeta = {
  title: 'Slide Transitions',
  createdAt: '2026-05-20T06:00:40.271Z',
};

export default [Cover, SlideRight, ScalePop, ClipWipe, BlurCross, End] satisfies Page[];
