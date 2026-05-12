import type { Page } from '@open-slide/core';
import type { ReactNode } from 'react';

const styles = `
@keyframes sp-pop {
  0%   { transform: scale(0.86) rotate(var(--sp-tilt, 0deg)); opacity: 0; }
  55%  { transform: scale(1.06) rotate(var(--sp-tilt, 0deg)); opacity: 1; }
  100% { transform: scale(1)    rotate(var(--sp-tilt, 0deg)); }
}
@keyframes sp-rise {
  0%   { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes sp-mask {
  0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
  20%  { opacity: 1; }
  100% { clip-path: inset(0 0 0 0);    opacity: 1; }
}
@keyframes sp-float {
  0%, 100% { transform: translate(0, 0)     rotate(0deg);  }
  33%      { transform: translate(8px, -12px) rotate(2deg); }
  66%      { transform: translate(-6px, 6px) rotate(-2deg);}
}
@keyframes sp-spin {
  0%   { transform: rotate(0deg);   }
  100% { transform: rotate(360deg); }
}
@keyframes sp-fade {
  0% { opacity: 0; } 100% { opacity: 1; }
}
`;

const SANS = "'Outfit', 'Inter Tight', 'Inter', system-ui, sans-serif";
const SERIF = "'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif";
const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const palette = {
  bg: '#FAEEDE',
  surface: '#FFF5E8',
  ink: '#2D1B4E',
  pink: '#FF4D8D',
  purple: '#6D4CFF',
  yellow: '#FFD24C',
  cream: '#FBE9D2',
  inkSoft: 'rgba(45, 27, 78, 0.10)',
};

const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      fontFamily: SANS,
      fontSize: 196,
      fontWeight: 800,
      lineHeight: 0.94,
      letterSpacing: '-0.035em',
      margin: 0,
      color: palette.ink,
    }}
  >
    {children}
  </h1>
);

const Serif = ({ children, color = palette.purple }: { children: ReactNode; color?: string }) => (
  <em
    style={{
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontWeight: 400,
      letterSpacing: '-0.025em',
      color,
    }}
  >
    {children}
  </em>
);

const Footer = ({ pageNum, total }: { pageNum: number; total: number }) => (
  <div
    style={{
      position: 'absolute',
      left: 130,
      right: 130,
      bottom: 64,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: MONO,
      fontSize: 14,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'rgba(45, 27, 78, 0.55)',
      animation: `sp-fade 1000ms ${EASE} 800ms both`,
    }}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        aria-hidden
        style={{ width: 10, height: 10, borderRadius: '50%', background: palette.pink }}
      />
      <span
        aria-hidden
        style={{ width: 10, height: 10, borderRadius: '50%', background: palette.purple }}
      />
      <span
        aria-hidden
        style={{ width: 10, height: 10, borderRadius: '50%', background: palette.yellow }}
      />
      <span style={{ marginLeft: 10 }}>Sticker Pop</span>
    </span>
    <span
      style={{
        background: palette.ink,
        color: palette.surface,
        padding: '8px 16px',
        borderRadius: 999,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.1em',
      }}
    >
      {String(pageNum).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </span>
  </div>
);

const Sticker = ({
  children,
  tone = 'pink',
  tilt = -3,
  delay = 0,
}: {
  children: ReactNode;
  tone?: 'pink' | 'purple' | 'yellow';
  tilt?: number;
  delay?: number;
}) => {
  const fill =
    tone === 'purple' ? palette.purple : tone === 'yellow' ? palette.yellow : palette.pink;
  const ink = tone === 'yellow' ? palette.ink : palette.surface;
  return (
    <span
      style={
        {
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: fill,
          color: ink,
          padding: '12px 22px',
          borderRadius: 999,
          fontFamily: SANS,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          transform: `rotate(${tilt}deg)`,
          boxShadow: `0 12px 28px -8px ${fill}55, 0 2px 0 rgba(45,27,78,0.08)`,
          ['--sp-tilt' as string]: `${tilt}deg`,
          animation: `sp-pop 720ms ${EASE_BOUNCE} ${delay}ms both`,
        } as React.CSSProperties
      }
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: ink,
          opacity: 0.6,
        }}
      />
      {children}
    </span>
  );
};

const Blob = ({
  size,
  color,
  top,
  left,
  right,
  bottom,
  delay = 0,
  blur = 0,
  opacity = 1,
}: {
  size: number;
  color: string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  delay?: number;
  blur?: number;
  opacity?: number;
}) => (
  <span
    aria-hidden
    style={{
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: blur ? `blur(${blur}px)` : undefined,
      opacity,
      animation: `sp-float 7s ease-in-out ${delay}ms infinite`,
    }}
  />
);

const Squiggle = ({ delay = 0 }: { delay?: number }) => (
  <svg
    aria-hidden
    width="120"
    height="120"
    viewBox="0 0 120 120"
    style={{
      position: 'absolute',
      right: 180,
      top: 380,
      animation: `sp-spin 28s linear ${delay}ms infinite`,
    }}
  >
    <title>squiggle</title>
    <circle
      cx="60"
      cy="60"
      r="50"
      stroke={palette.ink}
      strokeWidth="2"
      fill="none"
      strokeDasharray="4 8"
      opacity="0.35"
    />
  </svg>
);

const PaperGrain = () => (
  <svg
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0.08,
      mixBlendMode: 'multiply',
      pointerEvents: 'none',
    }}
  >
    <title>paper grain</title>
    <filter id="sp-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="11" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.11  0 0 0 0 0.30  0 0 0 0.5 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#sp-grain)" />
  </svg>
);

const pageBase: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: palette.bg,
  color: palette.ink,
  padding: '110px 130px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  fontFamily: SANS,
  position: 'relative',
  overflow: 'hidden',
};

const TOTAL = 3;

const Cover: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', gap: 44 }}>
    <style>{styles}</style>

    <Blob
      size={520}
      color={palette.yellow}
      top={-180}
      right={-120}
      opacity={0.55}
      blur={0}
      delay={0}
    />
    <Blob size={140} color={palette.pink} top={220} right={260} delay={400} />
    <Blob size={80} color={palette.purple} bottom={280} left={120} delay={900} />
    <Blob size={36} color={palette.ink} bottom={420} left={300} delay={1300} opacity={0.6} />
    <Squiggle delay={0} />
    <PaperGrain />

    <Sticker tone="pink" tilt={-4} delay={0}>
      chapter one
    </Sticker>

    <div style={{ animation: `sp-mask 1200ms ${EASE} 240ms both` }}>
      <Title>
        Big things,
        <br />
        made <Serif>tiny.</Serif>
      </Title>
    </div>

    <p
      style={{
        fontFamily: SANS,
        fontSize: 30,
        fontWeight: 500,
        lineHeight: 1.45,
        color: palette.ink,
        maxWidth: 1100,
        margin: 0,
        letterSpacing: '-0.01em',
        animation: `sp-rise 900ms ${EASE} 760ms both`,
        opacity: 0.86,
      }}
    >
      A short, cheerful tour of the small ideas{' '}
      <Serif color={palette.pink}>we have been having</Serif> lately.
    </p>

    <Footer pageNum={1} total={TOTAL} />
  </div>
);

const items: { tone: 'pink' | 'purple' | 'yellow'; label: string; body: string; tilt: number }[] = [
  {
    tone: 'pink',
    label: 'tiny wins',
    body: 'A two-line patch that saved the team an afternoon every week.',
    tilt: -2,
  },
  {
    tone: 'purple',
    label: 'side quest',
    body: 'A weekend tool that turned into the way we ship demos now.',
    tilt: 1.5,
  },
  {
    tone: 'yellow',
    label: 'one for fun',
    body: 'A toy build that taught us more about caching than any RFC.',
    tilt: -1,
  },
];

const toneFill = (t: 'pink' | 'purple' | 'yellow') =>
  t === 'purple' ? palette.purple : t === 'yellow' ? palette.yellow : palette.pink;

const Content: Page = () => (
  <div style={{ ...pageBase, gap: 56 }}>
    <style>{styles}</style>

    <Blob size={260} color={palette.yellow} top={-80} right={-60} opacity={0.4} delay={200} />
    <Blob size={48} color={palette.pink} bottom={260} right={200} delay={600} />
    <Blob size={28} color={palette.purple} top={120} left={520} delay={1000} />
    <PaperGrain />

    <Sticker tone="purple" tilt={-2} delay={0}>
      what we made
    </Sticker>

    <h2
      style={{
        fontFamily: SANS,
        fontSize: 92,
        fontWeight: 800,
        lineHeight: 1.0,
        letterSpacing: '-0.03em',
        margin: 0,
        color: palette.ink,
        maxWidth: 1280,
        animation: `sp-mask 1100ms ${EASE} 200ms both`,
      }}
    >
      Three small things that <Serif>made us smile.</Serif>
    </h2>

    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      {items.map((it, i) => (
        <li
          key={it.label}
          style={{
            background: palette.surface,
            border: `1px solid ${palette.inkSoft}`,
            borderRadius: 28,
            padding: '28px 36px',
            display: 'grid',
            gridTemplateColumns: '88px 220px 1fr',
            alignItems: 'center',
            columnGap: 32,
            boxShadow: `0 14px 30px -16px rgba(45,27,78,0.18), 0 2px 0 rgba(45,27,78,0.04)`,
            transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)`,
            animation: `sp-rise 900ms ${EASE} ${440 + i * 130}ms both`,
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: toneFill(it.tone),
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <Sticker tone={it.tone} tilt={it.tilt} delay={500 + i * 150}>
            {it.label}
          </Sticker>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 26,
              fontWeight: 500,
              lineHeight: 1.45,
              color: palette.ink,
              margin: 0,
              opacity: 0.85,
            }}
          >
            {it.body}
          </p>
        </li>
      ))}
    </ul>

    <Footer pageNum={2} total={TOTAL} />
  </div>
);

const Closer: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', gap: 40 }}>
    <style>{styles}</style>

    <Blob size={420} color={palette.pink} bottom={-160} left={-80} opacity={0.45} delay={0} />
    <Blob size={80} color={palette.yellow} top={180} right={220} delay={400} />
    <Blob size={36} color={palette.purple} top={300} right={140} delay={900} />
    <Blob size={48} color={palette.ink} bottom={380} left={420} delay={1300} opacity={0.5} />
    <Squiggle delay={2000} />
    <PaperGrain />

    <Sticker tone="yellow" tilt={3} delay={0}>
      that is all
    </Sticker>

    <div style={{ animation: `sp-mask 1200ms ${EASE} 240ms both` }}>
      <Title>
        Made with <Serif color={palette.pink}>love.</Serif>
      </Title>
    </div>

    <p
      style={{
        fontFamily: SANS,
        fontSize: 28,
        fontWeight: 500,
        lineHeight: 1.45,
        color: palette.ink,
        maxWidth: 1080,
        margin: 0,
        letterSpacing: '-0.005em',
        opacity: 0.86,
        animation: `sp-rise 900ms ${EASE} 760ms both`,
      }}
    >
      Borrow whatever you like. The confetti is on the house.
    </p>

    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        marginTop: 8,
        animation: `sp-rise 900ms ${EASE} 920ms both`,
      }}
    >
      <span aria-hidden style={{ width: 36, height: 1, background: palette.ink, opacity: 0.6 }} />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 14,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: palette.ink,
          opacity: 0.7,
        }}
      >
        the end · for now
      </span>
    </div>

    <Footer pageNum={TOTAL} total={TOTAL} />
  </div>
);

export default [Cover, Content, Closer];
