import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties } from 'react';
import openSlide from './assets/open-slide.png';

export const design: DesignSystem = {
  palette: { bg: '#f6f3ec', text: '#0a0a0a', accent: '#ff4f1a' },
  fonts: {
    display: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  },
  typeScale: { hero: 320, body: 40 },
  radius: 0,
};

const tokens = {
  ink: '#0a0a0a',
  paper: '#f6f3ec',
  accent: '#ff4f1a',
  cream: '#fffdf6',
  mono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
  serif: "'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif",
} as const;

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_POP = 'cubic-bezier(0.2, 1.1, 0.3, 1)';

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: 'var(--osd-font-display)',
  boxSizing: 'border-box',
};

const keyframes = `
@keyframes mWipeR { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes mWipeL { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 0); } }
@keyframes mWipeD { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes mWipeU { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }

@keyframes mSlamUp {
  0%   { opacity: 0; transform: translateY(160px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes mSlamDown {
  0%   { opacity: 0; transform: translateY(-160px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes mSlamL {
  0%   { opacity: 0; transform: translateX(-200px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes mSlamR {
  0%   { opacity: 0; transform: translateX(200px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes mPop {
  0%   { opacity: 0; transform: scale(0.6); }
  60%  { transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes mFlyIn {
  0%   { opacity: 0; transform: translate(var(--dx, -120px), var(--dy, -120px)) rotate(var(--r, -10deg)); }
  100% { opacity: 1; transform: translate(0, 0) rotate(0); }
}

@keyframes mSweepX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes mSweepY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes mPushR { from { transform: translateX(-105%); } to { transform: translateX(0); } }
@keyframes mPushL { from { transform: translateX(105%); } to { transform: translateX(0); } }

@keyframes mBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes mTick { from { transform: translateY(0); } to { transform: translateY(-100%); } }
@keyframes mFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
@keyframes mDrift {
  0%   { transform: translate(0, 0); }
  50%  { transform: translate(8px, -6px); }
  100% { transform: translate(0, 0); }
}
@keyframes mFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mRise {
  0%   { opacity: 0; transform: translateY(28px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes mReveal {
  0%   { opacity: 0; transform: translateY(36px); filter: blur(8px); }
  100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
}
`;

/* ───────────────── Helpers ───────────────── */

const Letters = ({
  text,
  className = '',
  delay = 0,
  step = 38,
  duration = 720,
  ease = 'cubic-bezier(0.2, 0.9, 0.25, 1)',
  anim = 'mSlamUp',
  style,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
  duration?: number;
  ease?: string;
  anim?: 'mSlamUp' | 'mSlamDown' | 'mSlamL' | 'mSlamR' | 'mPop';
  style?: CSSProperties;
}) => (
  <span className={className} style={{ display: 'inline-flex', whiteSpace: 'pre', ...style }}>
    {[...text].map((c, i) => (
      <span
        key={i}
        style={{
          display: 'inline-block',
          whiteSpace: 'pre',
          animation: `${anim} ${duration}ms ${ease} ${delay + i * step}ms both`,
        }}
      >
        {c}
      </span>
    ))}
  </span>
);

const Bar = ({
  color,
  delay,
  duration = 700,
  origin = 'left',
  axis = 'x',
  style,
}: {
  color: string;
  delay: number;
  duration?: number;
  origin?: 'left' | 'right' | 'top' | 'bottom';
  axis?: 'x' | 'y';
  style: CSSProperties;
}) => (
  <span
    style={{
      ...style,
      background: color,
      transformOrigin: origin,
      animation: `${
        axis === 'x' ? 'mSweepX' : 'mSweepY'
      } ${duration}ms cubic-bezier(0.7, 0, 0.2, 1) ${delay}ms both`,
    }}
  />
);

const Serif = ({
  children,
  color = tokens.accent,
}: {
  children: React.ReactNode;
  color?: string;
}) => (
  <em
    style={{
      fontFamily: tokens.serif,
      fontStyle: 'italic',
      fontWeight: 400,
      letterSpacing: '-0.025em',
      color,
    }}
  >
    {children}
  </em>
);

const Grain = ({
  tint = 'dark',
  opacity = 0.06,
}: {
  tint?: 'dark' | 'light';
  opacity?: number;
}) => (
  <svg
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity,
      mixBlendMode: tint === 'light' ? 'screen' : 'multiply',
      pointerEvents: 'none',
    }}
  >
    <title>grain</title>
    <filter id="m-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="2" seed="9" />
      <feColorMatrix
        type="matrix"
        values={
          tint === 'light'
            ? '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'
            : '0 0 0 0 0.04  0 0 0 0 0.04  0 0 0 0 0.04  0 0 0 0.55 0'
        }
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#m-grain)" />
  </svg>
);

const Brand = ({
  tone = 'ink',
  index,
  total = 7,
  delay = 1800,
}: {
  tone?: 'ink' | 'paper';
  index: number;
  total?: number;
  delay?: number;
}) => {
  const ink = tone === 'paper' ? tokens.paper : tokens.ink;
  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 140,
        bottom: 56,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: tokens.mono,
        fontSize: 16,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: ink,
        opacity: 0.55,
        animation: `mFade 800ms ease ${delay}ms both`,
        pointerEvents: 'none',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span
          aria-hidden
          style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.accent }}
        />
        open-slide
      </span>
      <span style={{ fontVariantNumeric: 'tabular-nums', display: 'inline-flex', gap: 6 }}>
        <span style={{ opacity: 1 }}>{String(index).padStart(2, '0')}</span>
        <span style={{ opacity: 0.45 }}>/</span>
        <span style={{ opacity: 0.6 }}>{String(total).padStart(2, '0')}</span>
      </span>
    </div>
  );
};

/* ─────────────────────── 1. Introducing ─────────────────────── */

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      background: tokens.paper,
      color: tokens.ink,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 140px',
    }}
  >
    <style>{keyframes}</style>
    <Grain />

    {/* Top hairline + bottom chunky rule — paired editorial weight */}
    <Bar
      color={tokens.ink}
      delay={120}
      duration={1100}
      origin="left"
      style={{ position: 'absolute', top: 96, left: 140, right: 140, height: 1, opacity: 0.65 }}
    />
    <Bar
      color={tokens.accent}
      delay={260}
      duration={1100}
      origin="right"
      style={{ position: 'absolute', bottom: 96, left: 140, right: 140, height: 6 }}
    />

    {/* Eyebrow */}
    <div
      style={{
        fontFamily: tokens.mono,
        fontSize: 18,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        color: tokens.accent,
        marginBottom: 56,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 16,
        animation: `mWipeR 900ms ${EASE_OUT} 360ms both`,
      }}
    >
      <span aria-hidden style={{ width: 28, height: 1, background: tokens.accent }} />
      Introducing — v0.1
    </div>

    {/* Logo + wordmark lockup */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 56,
        marginBottom: 72,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          animation: `mPop 900ms ${EASE_POP} 620ms both`,
        }}
      >
        <img
          src={openSlide}
          alt="open-slide square logo mark"
          style={{ width: 280, height: 280, objectFit: 'cover' }}
        />
      </div>

      <div
        style={{
          fontSize: '184px',
          fontWeight: 900,
          letterSpacing: '-0.055em',
          lineHeight: 0.9,
          margin: 0,
          display: 'flex',
          overflowY: 'hidden',
          paddingBottom: 16,
          paddingRight: 24,
        }}
      >
        <Letters text="open-slide" delay={900} step={52} duration={840} ease={EASE_OUT} />
      </div>
    </div>

    {/* Tagline */}
    <div
      style={{
        fontSize: 84,
        fontWeight: 700,
        letterSpacing: '-0.035em',
        lineHeight: 1.04,
        margin: 0,
        maxWidth: 1520,
      }}
    >
      <div style={{ overflow: 'hidden' }}>
        <Letters text="A slide framework " delay={1700} step={28} duration={780} ease={EASE_OUT} />
      </div>
      <div style={{ overflow: 'hidden', marginTop: 4, display: 'flex', alignItems: 'baseline' }}>
        <Letters text="built for " delay={2080} step={28} duration={780} ease={EASE_OUT} />
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            animation: `mReveal 1000ms ${EASE_OUT} 2360ms both`,
          }}
        >
          <Serif>agents.</Serif>
          <Bar
            color={tokens.accent}
            delay={2820}
            duration={900}
            origin="left"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 4,
              height: 4,
            }}
          />
        </span>
      </div>
    </div>

    <Brand index={1} delay={3400} />
  </div>
);

/* ─────────────────────── 2. /create-slide ─────────────────────── */

const Skill: Page = () => (
  <div
    style={{
      ...fill,
      background: tokens.ink,
      color: tokens.paper,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '0 140px',
    }}
  >
    <style>{keyframes}</style>
    <Grain tint="light" opacity={0.04} />

    {/* Top accent bar — sweeps across the top edge */}
    <Bar
      color={tokens.accent}
      delay={0}
      duration={900}
      origin="left"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 8,
      }}
    />

    {/* Big ghost numeral behind */}
    <div
      style={{
        position: 'absolute',
        top: 40,
        left: -40,
        fontSize: 580,
        fontWeight: 900,
        color: 'transparent',
        WebkitTextStroke: `2px rgba(246, 243, 236, 0.08)`,
        letterSpacing: '-0.06em',
        lineHeight: 0.82,
        userSelect: 'none',
        animation: `mFade 1600ms ease 400ms both`,
      }}
    >
      01
    </div>

    {/* Small label */}
    <div
      style={{
        fontFamily: tokens.mono,
        fontSize: 18,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        color: tokens.accent,
        marginBottom: 32,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 16,
        animation: `mWipeR 900ms ${EASE_OUT} 420ms both`,
      }}
    >
      <span aria-hidden style={{ width: 28, height: 1, background: tokens.accent }} />
      Skill — step 01
    </div>

    {/* Hero command */}
    <div
      style={{
        fontFamily: tokens.mono,
        fontSize: '188px',
        fontWeight: 700,
        letterSpacing: '-0.05em',
        lineHeight: 1,
        margin: 0,
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
      }}
    >
      <Letters
        text="/create-slide"
        delay={680}
        step={56}
        duration={860}
        anim="mSlamUp"
        ease={EASE_OUT}
      />
      <span
        style={{
          display: 'inline-block',
          width: 26,
          height: 188,
          background: tokens.accent,
          marginLeft: 18,
          animation: `mFade 240ms ease 1700ms both, mBlink 1s steps(1) 1900ms infinite`,
        }}
      />
    </div>

    {/* Underline + caption row */}
    <div
      style={{
        marginTop: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        width: '100%',
      }}
    >
      <Bar
        color={tokens.paper}
        delay={1800}
        duration={1100}
        origin="left"
        style={{ height: 2, flex: 1, opacity: 0.4 }}
      />
      <div
        style={{
          fontSize: 32,
          color: tokens.paper,
          opacity: 0.85,
          whiteSpace: 'nowrap',
          animation: `mRise 900ms ${EASE_OUT} 2200ms both`,
        }}
      >
        tell the agent — <Serif color={tokens.paper}>it writes the deck.</Serif>
      </div>
    </div>

    <Brand tone="paper" index={2} delay={3000} />
  </div>
);

/* ─────────────────────── 3. Inspect & send ─────────────────────── */

const Inspect: Page = () => {
  const Step = ({
    n,
    label,
    delay,
    accent = false,
    serifTail,
  }: {
    n: string;
    label: string;
    delay: number;
    accent?: boolean;
    serifTail?: React.ReactNode;
  }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 40,
        animation: `mRise 1000ms ${EASE_OUT} ${delay}ms both`,
      }}
    >
      <span
        style={{
          fontFamily: tokens.mono,
          fontSize: 22,
          letterSpacing: '0.32em',
          color: tokens.accent,
          width: 64,
          flexShrink: 0,
          paddingTop: 8,
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontSize: 196,
          fontWeight: 900,
          letterSpacing: '-0.045em',
          lineHeight: 0.96,
          color: accent ? tokens.accent : tokens.ink,
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 14,
        }}
      >
        {label}
        {serifTail}
      </span>
    </div>
  );

  return (
    <div
      style={{
        ...fill,
        background: tokens.paper,
        color: tokens.ink,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 140px',
      }}
    >
      <style>{keyframes}</style>
      <Grain />

      {/* Inspector viewport motif: accent square + hairline ghost frame + crosshair tick */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          right: 140,
          width: 220,
          height: 220,
          background: tokens.accent,
          animation: `mPushL 900ms ${EASE_OUT} 320ms both, mDrift 6s ease-in-out 1.4s infinite`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 120,
          right: 140,
          width: 220,
          height: 220,
          border: `1px solid ${tokens.ink}`,
          transform: 'translate(40px, 40px)',
          animation: `mFade 900ms ease 880ms both`,
        }}
      />
      {/* corner brackets on the accent square */}
      {(
        [
          [0, 0, '0deg'],
          [220, 0, '90deg'],
          [220, 220, '180deg'],
          [0, 220, '270deg'],
        ] as const
      ).map(([dx, dy, rot], i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: 120 + dy - 12,
            right: 140 + (220 - dx) - 12,
            width: 24,
            height: 24,
            borderTop: `2px solid ${tokens.ink}`,
            borderLeft: `2px solid ${tokens.ink}`,
            transform: `rotate(${rot})`,
            animation: `mPop 600ms ${EASE_POP} ${1100 + i * 80}ms both`,
          }}
        />
      ))}
      {/* tiny mono coord readout under the viewport */}
      <div
        style={{
          position: 'absolute',
          top: 120 + 220 + 24,
          right: 140,
          width: 220,
          textAlign: 'right',
          fontFamily: tokens.mono,
          fontSize: 14,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: tokens.ink,
          opacity: 0.55,
          animation: `mFade 800ms ease 1500ms both`,
        }}
      >
        x: 1442 · y: 86
      </div>

      <Step n="01" label="Inspect." delay={400} />
      <div style={{ height: 28 }} />
      <Step n="02" label="Comment." delay={720} />
      <div style={{ height: 28 }} />
      <Step
        n="03"
        label="Send"
        delay={1040}
        accent
        serifTail={<Serif color={tokens.accent}>→</Serif>}
      />

      {/* Bottom strapline */}
      <div
        style={{
          position: 'absolute',
          bottom: 140,
          left: 140,
          right: 140,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 26,
          color: tokens.ink,
          animation: `mFade 900ms ease 1800ms both`,
        }}
      >
        <span>
          Point at the canvas <Serif>—</Serif>
        </span>
        <span style={{ opacity: 0.7 }}>the agent fixes it</span>
      </div>

      <Brand index={3} delay={2200} />
    </div>
  );
};

/* ─────────────────────── 4. Visual Editor ─────────────────────── */

const VisualCorner = ({
  left,
  top,
  rot,
  delay,
}: {
  left: number;
  top: number;
  rot: string;
  delay: number;
}) => (
  <span
    style={{
      position: 'absolute',
      left: left - 28,
      top: top - 28,
      width: 56,
      height: 56,
      borderTop: `4px solid ${tokens.ink}`,
      borderLeft: `4px solid ${tokens.ink}`,
      transform: `rotate(${rot})`,
      animation: `mPop 600ms ${EASE_POP} ${delay}ms both`,
    }}
  />
);

const Visual: Page = () => (
  <div
    style={{
      ...fill,
      background: tokens.accent,
      color: tokens.ink,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 0,
    }}
  >
    <style>{keyframes}</style>

    {/* Push-in ink slab from left */}
    <Bar
      color={tokens.ink}
      delay={0}
      duration={900}
      origin="left"
      style={{
        position: 'absolute',
        top: 96,
        left: 0,
        width: '40%',
        height: 48,
      }}
    />
    {/* Push-in ink slab from right (opposite line) */}
    <Bar
      color={tokens.ink}
      delay={160}
      duration={900}
      origin="right"
      style={{
        position: 'absolute',
        bottom: 96,
        right: 0,
        width: '40%',
        height: 48,
      }}
    />

    {/* "VISUAL" — wipes down (clip-path mask) */}
    <div
      style={{
        fontSize: 380,
        fontWeight: 900,
        letterSpacing: '-0.055em',
        lineHeight: 0.84,
        paddingRight: 24,
        animation: `mWipeD 1100ms ${EASE_OUT} 460ms both`,
      }}
    >
      VISUAL
    </div>

    {/* Strikethrough sweep across between */}
    <div
      style={{
        position: 'relative',
        height: 28,
        width: '64%',
        margin: '18px 0',
      }}
    >
      <Bar
        color={tokens.paper}
        delay={1300}
        duration={900}
        origin="left"
        style={{
          position: 'absolute',
          inset: 0,
        }}
      />
    </div>

    {/* "EDITOR" — wipes up */}
    <div
      style={{
        fontSize: 380,
        fontWeight: 900,
        letterSpacing: '-0.055em',
        lineHeight: 0.84,
        paddingRight: 24,
        color: tokens.paper,
        animation: `mWipeU 1100ms ${EASE_OUT} 1500ms both`,
      }}
    >
      EDITOR
    </div>

    {/* Caption — flows below EDITOR inside the centered flex stack */}
    <div
      style={{
        marginTop: 44,
        fontFamily: tokens.mono,
        fontSize: 22,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        color: tokens.ink,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        animation: `mWipeR 900ms ${EASE_OUT} 2500ms both`,
      }}
    >
      drag{' '}
      <span aria-hidden style={{ width: 14, height: 1, background: tokens.ink, opacity: 0.55 }} />
      resize{' '}
      <span aria-hidden style={{ width: 14, height: 1, background: tokens.ink, opacity: 0.55 }} />
      retype
    </div>

    {/* Selection corner marks pinned to the canvas corners, clear of the bars */}
    <VisualCorner left={40} top={40} rot="0deg" delay={2100} />
    <VisualCorner left={1880} top={40} rot="90deg" delay={2200} />
    <VisualCorner left={40} top={1040} rot="270deg" delay={2300} />
    <VisualCorner left={1880} top={1040} rot="180deg" delay={2400} />
  </div>
);

/* ─────────────────────── 5. Design system ─────────────────────── */

const Swatch = ({
  name,
  value,
  hint,
  text,
  delay,
}: {
  name: string;
  value: string;
  hint: string;
  text: string;
  delay: number;
}) => (
  <div
    style={{
      flex: 1,
      background: value,
      color: text,
      position: 'relative',
      transformOrigin: 'bottom',
      animation: `mSweepY 1000ms ${EASE_OUT} ${delay}ms both`,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 88,
        left: 40,
        right: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        animation: `mWipeR 900ms ${EASE_OUT} ${delay + 700}ms both`,
      }}
    >
      <span aria-hidden style={{ height: 1, width: 32, background: text, opacity: 0.55 }} />
      <span
        style={{
          fontFamily: tokens.mono,
          fontSize: 16,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          opacity: 0.85,
        }}
      >
        {name}
      </span>
    </div>
    <div
      style={{
        position: 'absolute',
        bottom: 92,
        left: 40,
        right: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        animation: `mRise 900ms ${EASE_OUT} ${delay + 950}ms both`,
      }}
    >
      <span
        style={{
          fontFamily: tokens.mono,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: tokens.mono,
          fontSize: 13,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          opacity: 0.55,
        }}
      >
        {hint}
      </span>
    </div>
  </div>
);

const DesignPanel: Page = () => (
  <div
    style={{
      ...fill,
      background: tokens.paper,
      color: tokens.ink,
      display: 'flex',
    }}
  >
    <style>{keyframes}</style>

    {/* Four full-height color stripes pushing up from below */}
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <Swatch name="bg / paper" value="#F6F3EC" hint="canvas" text={tokens.ink} delay={120} />
      <Swatch
        name="ink / text"
        value="#0A0A0A"
        hint="primary type"
        text={tokens.paper}
        delay={240}
      />
      <Swatch
        name="accent"
        value="#FF4F1A"
        hint="emphasis · italic serif"
        text={tokens.paper}
        delay={360}
      />
      <Swatch
        name="muted"
        value="#7A7468"
        hint="captions · footers"
        text={tokens.paper}
        delay={480}
      />
    </div>

    {/* Center title — slabs in, refined without the chunky box-shadow */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        gap: 12,
      }}
    >
      <div
        style={{
          background: tokens.paper,
          color: tokens.ink,
          padding: '32px 64px',
          fontSize: 168,
          fontWeight: 900,
          letterSpacing: '-0.045em',
          lineHeight: 0.94,
          animation: `mPop 900ms ${EASE_POP} 1700ms both`,
          border: `1px solid ${tokens.ink}`,
        }}
      >
        DESIGN
      </div>
      <div
        style={{
          background: tokens.ink,
          color: tokens.paper,
          padding: '32px 64px',
          fontSize: 168,
          fontWeight: 900,
          letterSpacing: '-0.045em',
          lineHeight: 0.94,
          animation: `mPop 900ms ${EASE_POP} 1900ms both`,
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 18,
        }}
      >
        SYSTEM<Serif color={tokens.accent}>.</Serif>
      </div>
    </div>
  </div>
);

/* ─────────────────────── 6. Assets manager ─────────────────────── */

const AssetBlock = ({
  x,
  y,
  w,
  h,
  color,
  dx,
  dy,
  r,
  delay,
  label,
  light = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  dx: string;
  dy: string;
  r: string;
  delay: number;
  label: string;
  light?: boolean;
}) => (
  <div
    style={
      {
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: color,
        ['--dx' as string]: dx,
        ['--dy' as string]: dy,
        ['--r' as string]: r,
        boxShadow: light ? `inset 0 0 0 1px rgba(10,10,10,0.05)` : undefined,
        animation: `mFlyIn 1000ms ${EASE_OUT} ${delay}ms both`,
      } as CSSProperties
    }
  >
    <div
      style={{
        position: 'absolute',
        bottom: 18,
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: tokens.mono,
        fontSize: 13,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: light ? tokens.ink : tokens.paper,
        opacity: 0.78,
        animation: `mFade 700ms ease ${delay + 700}ms both`,
      }}
    >
      <span>{label}</span>
      <span style={{ opacity: 0.55 }}>
        {w}×{h}
      </span>
    </div>
  </div>
);

const Assets: Page = () => (
  <div
    style={{
      ...fill,
      background: tokens.ink,
      color: tokens.paper,
    }}
  >
    <style>{keyframes}</style>

    <AssetBlock
      x={140}
      y={120}
      w={360}
      h={220}
      color={tokens.accent}
      dx="-200px"
      dy="-200px"
      r="-12deg"
      delay={260}
      label="hero.png"
    />
    <AssetBlock
      x={540}
      y={90}
      w={480}
      h={280}
      color="#f5b85a"
      dx="0px"
      dy="-260px"
      r="8deg"
      delay={380}
      label="intro.mp4"
      light
    />
    <AssetBlock
      x={1060}
      y={130}
      w={420}
      h={300}
      color={tokens.paper}
      dx="240px"
      dy="-220px"
      r="-6deg"
      delay={500}
      label="logo.svg"
      light
    />
    <AssetBlock
      x={1520}
      y={110}
      w={280}
      h={260}
      color={tokens.cream}
      dx="320px"
      dy="-180px"
      r="14deg"
      delay={620}
      label="Inter.ttf"
      light
    />
    <AssetBlock
      x={180}
      y={700}
      w={320}
      h={260}
      color={tokens.cream}
      dx="-280px"
      dy="260px"
      r="12deg"
      delay={440}
      label="cover.jpg"
      light
    />
    <AssetBlock
      x={560}
      y={720}
      w={360}
      h={240}
      color={tokens.accent}
      dx="-100px"
      dy="300px"
      r="-10deg"
      delay={560}
      label="chart.svg"
    />
    <AssetBlock
      x={980}
      y={700}
      w={460}
      h={260}
      color={tokens.paper}
      dx="120px"
      dy="300px"
      r="6deg"
      delay={680}
      label="team.webp"
      light
    />
    <AssetBlock
      x={1480}
      y={720}
      w={300}
      h={240}
      color="#f5b85a"
      dx="320px"
      dy="260px"
      r="-14deg"
      delay={800}
      label="JetBrains.woff2"
      light
    />

    {/* Center mega title */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontSize: 400,
          fontWeight: 900,
          letterSpacing: '-0.055em',
          lineHeight: 0.84,
          color: tokens.paper,
          mixBlendMode: 'difference',
          animation: `mPop 1100ms ${EASE_POP} 1400ms both`,
        }}
      >
        ASSETS
      </div>
    </div>

    {/* Bottom mono ticker */}
    <div
      style={{
        position: 'absolute',
        bottom: 56,
        left: 140,
        right: 140,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: tokens.mono,
        fontSize: 16,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: tokens.paper,
        opacity: 0.55,
        animation: `mFade 900ms ease 2200ms both`,
        pointerEvents: 'none',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
        <span
          aria-hidden
          style={{ width: 24, height: 1, background: tokens.accent, opacity: 0.9 }}
        />
        image · video · vector · font
      </span>
      <span>drop · paste · import</span>
    </div>
  </div>
);

/* ─────────────────────── 7. CLI init ─────────────────────── */

const Cli: Page = () => (
  <div
    style={{
      ...fill,
      background: tokens.paper,
      color: tokens.ink,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '0 140px',
    }}
  >
    <style>{keyframes}</style>
    <Grain />

    {/* Top accent hairline */}
    <Bar
      color={tokens.accent}
      delay={120}
      duration={1100}
      origin="left"
      style={{
        position: 'absolute',
        top: 120,
        left: 140,
        right: 140,
        height: 6,
      }}
    />

    {/* Eyebrow */}
    <div
      style={{
        marginTop: 40,
        fontFamily: tokens.mono,
        fontSize: 18,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        color: tokens.accent,
        marginBottom: 64,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 16,
        animation: `mWipeR 900ms ${EASE_OUT} 420ms both`,
      }}
    >
      <span aria-hidden style={{ width: 28, height: 1, background: tokens.accent }} />
      Available now — v0.1
    </div>

    {/* Hero command line */}
    <div
      style={{
        fontFamily: tokens.mono,
        fontSize: '108px',
        fontWeight: 700,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: 14,
      }}
    >
      <span
        style={{
          color: tokens.accent,
          animation: `mPop 700ms ${EASE_POP} 720ms both`,
        }}
      >
        $
      </span>
      <Letters
        text="npx @open-slide/cli init"
        delay={920}
        step={48}
        duration={760}
        anim="mSlamUp"
        ease={EASE_OUT}
      />
      <span
        style={{
          display: 'inline-block',
          width: 22,
          height: 120,
          background: tokens.ink,
          marginLeft: 8,
          alignSelf: 'center',
          animation: `mFade 240ms ease 2200ms both, mBlink 1s steps(1) 2400ms infinite`,
        }}
      />
    </div>

    {/* Underline sweep */}
    <Bar
      color={tokens.ink}
      delay={2400}
      duration={1300}
      origin="left"
      style={{
        marginTop: 64,
        height: 4,
        width: 'calc(100% - 240px)',
      }}
    />

    {/* Tag line below */}
    <div
      style={{
        marginTop: 56,
        fontSize: 72,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1.04,
        animation: `mReveal 1100ms ${EASE_OUT} 2800ms both`,
      }}
    >
      Build slides with your <Serif>agent.</Serif>
    </div>

    {/* Bottom rail */}
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: 140,
        right: 140,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: tokens.mono,
        fontSize: 18,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: tokens.ink,
        opacity: 0.75,
        animation: `mFade 900ms ease 3500ms both`,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <span
          aria-hidden
          style={{ width: 6, height: 6, borderRadius: '50%', background: tokens.accent }}
        />
        open-slide.dev
      </span>
      <span style={{ opacity: 0.7 }}>npm i @open-slide/core</span>
    </div>

    <Brand index={7} delay={3800} />
  </div>
);

export const meta: SlideMeta = { title: 'open-slide — Launch Motion' };
export default [Cover, Skill, Inspect, Visual, DesignPanel, Assets, Cli] satisfies Page[];
