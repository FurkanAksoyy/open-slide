import type { Page } from '@open-slide/core';
import type { ReactNode } from 'react';

const styles = `
@keyframes bs-rise {
  0%   { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes bs-mask {
  0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
  20%  { opacity: 1; }
  100% { clip-path: inset(0 0 0 0); opacity: 1; }
}
@keyframes bs-line {
  0%   { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}
@keyframes bs-fade {
  0% { opacity: 0; } 100% { opacity: 1; }
}
@keyframes bs-dot {
  0%, 100% { transform: scale(1);   }
  50%      { transform: scale(1.15);}
}
`;

const SANS = "'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const SERIF = "'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif";
const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const palette = {
  bg: '#FCFBF7',
  text: '#0F0F10',
  muted: '#6B6B70',
  faint: '#A4A4A8',
  hairline: 'rgba(15,15,16,0.08)',
  hairlineSoft: 'rgba(15,15,16,0.04)',
  ink: '#1E40AF',
  red: '#B91C1C',
  ochre: '#A16207',
  forest: '#15803D',
};

const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      fontFamily: SANS,
      fontSize: 176,
      fontWeight: 500,
      lineHeight: 0.94,
      letterSpacing: '-0.04em',
      margin: 0,
      color: palette.text,
      fontFeatureSettings: '"ss01", "cv11"',
    }}
  >
    {children}
  </h1>
);

const Serif = ({ children }: { children: ReactNode }) => (
  <em
    style={{
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontWeight: 400,
      letterSpacing: '-0.025em',
      color: palette.ink,
    }}
  >
    {children}
  </em>
);

const Footer = ({
  pageNum,
  total,
  label = 'Spring update — 2026',
}: {
  pageNum: number;
  total: number;
  label?: string;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 140,
      right: 140,
      bottom: 64,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: MONO,
      fontSize: 14,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: palette.muted,
      animation: `bs-fade 1000ms ${EASE} 700ms both`,
    }}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <span
        aria-hidden
        style={{ width: 6, height: 6, borderRadius: '50%', background: palette.ink }}
      />
      {label}
    </span>
    <span style={{ fontVariantNumeric: 'tabular-nums', display: 'inline-flex', gap: 6 }}>
      <span style={{ color: palette.text }}>{String(pageNum).padStart(2, '0')}</span>
      <span style={{ opacity: 0.4 }}>/</span>
      <span style={{ opacity: 0.5 }}>{String(total).padStart(2, '0')}</span>
    </span>
  </div>
);

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      alignSelf: 'flex-start',
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 14,
    }}
  >
    <span
      aria-hidden
      style={{
        height: 1,
        width: 56,
        background: palette.ink,
        transformOrigin: 'left',
        animation: `bs-line 700ms ${EASE} 0ms both`,
      }}
    />
    <span
      style={{
        fontFamily: MONO,
        fontSize: 14,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: palette.muted,
      }}
    >
      {children}
    </span>
  </div>
);

const Hairline = ({ width = 96, delay = 0 }: { width?: number; delay?: number }) => (
  <span
    aria-hidden
    style={{
      display: 'block',
      height: 1,
      width,
      background: palette.text,
      transformOrigin: 'left',
      animation: `bs-line 800ms ${EASE} ${delay}ms both`,
    }}
  />
);

const pageBase: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: palette.bg,
  color: palette.text,
  padding: '120px 140px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  fontFamily: SANS,
  position: 'relative',
  overflow: 'hidden',
};

const PaperWash = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background:
        'radial-gradient(ellipse at 18% 12%, rgba(30,64,175,0.05), transparent 55%),' +
        'radial-gradient(ellipse at 84% 88%, rgba(161,98,7,0.05), transparent 60%)',
    }}
  />
);

const TOTAL = 3;

const Cover: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', gap: 44 }}>
    <style>{styles}</style>
    <PaperWash />

    <div style={{ animation: `bs-rise 900ms ${EASE} 0ms both` }}>
      <Eyebrow>Vol. 03 — Spring update</Eyebrow>
    </div>

    <div
      style={{
        animation: `bs-mask 1200ms ${EASE} 240ms both`,
      }}
    >
      <Title>
        Built for the moments
        <br />
        <Serif>that matter.</Serif>
      </Title>
    </div>

    <div style={{ animation: `bs-line 800ms ${EASE} 760ms both`, transformOrigin: 'left' }}>
      <Hairline width={120} />
    </div>

    <p
      style={{
        fontFamily: SANS,
        fontSize: 26,
        fontWeight: 400,
        lineHeight: 1.55,
        color: palette.muted,
        maxWidth: 900,
        margin: 0,
        letterSpacing: '-0.005em',
        animation: `bs-rise 900ms ${EASE} 860ms both`,
      }}
    >
      Four small features that make the next eight months of work feel a little easier — none louder
      than they need to be.
    </p>

    <Footer pageNum={1} total={TOTAL} />
  </div>
);

type Card = {
  ink: string;
  title: string;
  body: string;
};

const cards: Card[] = [
  {
    ink: palette.ink,
    title: 'Smart drafts',
    body: 'Pick up a thought from anywhere and finish it in one place.',
  },
  {
    ink: palette.red,
    title: 'Fewer alerts',
    body: 'We grouped seventeen kinds of notifications down to four.',
  },
  {
    ink: palette.ochre,
    title: 'Faster replies',
    body: 'Suggested responses now read your tone, not just your inbox.',
  },
  {
    ink: palette.forest,
    title: 'Cleaner search',
    body: 'Find a doc by what you remember, not by what you titled it.',
  },
];

const Content: Page = () => (
  <div style={{ ...pageBase, gap: 72 }}>
    <style>{styles}</style>
    <PaperWash />

    <header style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ animation: `bs-rise 900ms ${EASE} 0ms both` }}>
        <Eyebrow>What is new</Eyebrow>
      </div>
      <h2
        style={{
          fontFamily: SANS,
          fontSize: 84,
          fontWeight: 500,
          letterSpacing: '-0.03em',
          lineHeight: 1.02,
          margin: 0,
          color: palette.text,
          maxWidth: 1280,
          animation: `bs-mask 1100ms ${EASE} 200ms both`,
        }}
      >
        Four features, <Serif>one quiet release.</Serif>
      </h2>
    </header>

    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {cards.map((c, i) => (
        <li
          key={c.title}
          style={{
            display: 'grid',
            gridTemplateColumns: '88px 1fr 480px',
            alignItems: 'baseline',
            columnGap: 40,
            padding: '32px 0',
            borderTop: `1px solid ${palette.hairline}`,
            borderBottom: i === cards.length - 1 ? `1px solid ${palette.hairline}` : 'none',
            animation: `bs-rise 950ms ${EASE} ${440 + i * 110}ms both`,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 16,
              letterSpacing: '0.14em',
              color: palette.muted,
              fontVariantNumeric: 'tabular-nums',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: c.ink,
                animation: `bs-dot 3s ease-in-out ${i * 200}ms infinite`,
              }}
            />
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3
            style={{
              fontFamily: SANS,
              fontSize: 44,
              fontWeight: 500,
              letterSpacing: '-0.022em',
              margin: 0,
              color: palette.text,
              lineHeight: 1.05,
            }}
          >
            {c.title}
          </h3>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 21,
              lineHeight: 1.55,
              color: palette.muted,
              margin: 0,
            }}
          >
            {c.body}
          </p>
        </li>
      ))}
    </ul>

    <Footer pageNum={2} total={TOTAL} label="Spring update — features" />
  </div>
);

const Closer: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', gap: 40 }}>
    <style>{styles}</style>
    <PaperWash />

    <div style={{ animation: `bs-rise 900ms ${EASE} 0ms both` }}>
      <Eyebrow>Available today</Eyebrow>
    </div>

    <div style={{ animation: `bs-mask 1200ms ${EASE} 240ms both` }}>
      <Title>
        Roll out at <Serif>your own pace.</Serif>
      </Title>
    </div>

    <Hairline width={120} delay={760} />

    <p
      style={{
        fontSize: 28,
        lineHeight: 1.5,
        color: palette.muted,
        maxWidth: 1080,
        margin: 0,
        letterSpacing: '-0.005em',
        animation: `bs-rise 900ms ${EASE} 860ms both`,
      }}
    >
      Everything in this deck is opt-in. Turn it on for one team, then the next, then the rest.
    </p>

    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
        fontFamily: MONO,
        fontSize: 14,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: palette.text,
        animation: `bs-rise 900ms ${EASE} 980ms both`,
      }}
    >
      <span>Read the changelog</span>
      <span aria-hidden style={{ width: 24, height: 1, background: palette.text }} />
    </div>

    <Footer pageNum={TOTAL} total={TOTAL} label="Spring update — available today" />
  </div>
);

export default [Cover, Content, Closer];
