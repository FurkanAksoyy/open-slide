import type { Page } from '@open-slide/core';
import type { ReactNode } from 'react';

const styles = `
@keyframes au-reveal {
  0%   { opacity: 0; transform: translateY(28px); filter: blur(8px); }
  100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
}
@keyframes au-rise {
  0%   { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes au-fade {
  0% { opacity: 0; } 100% { opacity: 1; }
}
@keyframes au-hairline {
  0%   { transform: scaleX(0); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: scaleX(1); opacity: 1; }
}
@keyframes au-glow {
  0%, 100% { opacity: 0.42; transform: translate(-50%, -50%) scale(1);     }
  50%      { opacity: 0.72; transform: translate(-50%, -50%) scale(1.06);  }
}
@keyframes au-glow-warm {
  0%, 100% { opacity: 0.18; transform: translate(-50%, -50%) scale(1);     }
  50%      { opacity: 0.36; transform: translate(-50%, -50%) scale(1.08);  }
}
@keyframes au-dot {
  0%, 100% { box-shadow: 0 0 12px #A78BFA, 0 0 0 0 rgba(167,139,250,0); }
  50%      { box-shadow: 0 0 22px #A78BFA, 0 0 0 6px rgba(167,139,250,0.08); }
}
`;

const SANS = "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', system-ui, sans-serif";
const SERIF = "'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif";
const MONO = "'SF Mono', 'JetBrains Mono', 'Menlo', monospace";

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      fontFamily: SANS,
      fontSize: 168,
      fontWeight: 500,
      lineHeight: 0.95,
      letterSpacing: '-0.035em',
      margin: 0,
      color: '#FAFAFA',
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
      color: '#E6DFFD',
    }}
  >
    {children}
  </em>
);

const Footer = ({
  pageNum,
  total,
  path = '~/release-notes',
}: {
  pageNum: number;
  total: number;
  path?: string;
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
      fontSize: 18,
      letterSpacing: '0.06em',
      color: '#737373',
      animation: `au-fade 1200ms ${EASE} 600ms both`,
    }}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#A78BFA',
          boxShadow: '0 0 8px #A78BFA',
        }}
      />
      <span>{path}</span>
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ color: '#FAFAFA', fontVariantNumeric: 'tabular-nums' }}>
        {String(pageNum).padStart(2, '0')}
      </span>
      <span style={{ opacity: 0.35 }}>—</span>
      <span style={{ opacity: 0.5, fontVariantNumeric: 'tabular-nums' }}>
        {String(total).padStart(2, '0')}
      </span>
    </span>
  </div>
);

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '9px 18px 9px 14px',
      borderRadius: 999,
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.025)',
      backdropFilter: 'blur(8px)',
      fontFamily: MONO,
      fontSize: 15,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: '#A8A29E',
    }}
  >
    <span
      aria-hidden
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: '#A78BFA',
        animation: 'au-dot 2.6s ease-in-out infinite',
      }}
    />
    {children}
  </div>
);

const Glow = ({
  x = '50%',
  y = '50%',
  size = 1400,
  color = '#A78BFA',
  warm = false,
  delay = 0,
}: {
  x?: string;
  y?: string;
  size?: number;
  color?: string;
  warm?: boolean;
  delay?: number;
}) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      transform: 'translate(-50%, -50%)',
      background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
      filter: 'blur(60px)',
      pointerEvents: 'none',
      animation: `${warm ? 'au-glow-warm' : 'au-glow'} 7s ease-in-out ${delay}ms infinite`,
    }}
  />
);

const Grain = () => (
  <svg
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0.05,
      mixBlendMode: 'screen',
      pointerEvents: 'none',
    }}
  >
    <title>grain</title>
    <filter id="au-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#au-grain)" />
  </svg>
);

const Vignette = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 50% 120%, transparent 40%, rgba(0,0,0,0.55) 100%)',
      pointerEvents: 'none',
    }}
  />
);

const pageBase: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#070707',
  color: '#FAFAFA',
  padding: '120px 140px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  fontFamily: SANS,
  position: 'relative',
  overflow: 'hidden',
};

const stack = (delay = 0, dur = 1000): React.CSSProperties => ({
  animation: `au-rise ${dur}ms ${EASE} ${delay}ms both`,
});

const TOTAL = 3;

const Cover: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', gap: 44 }}>
    <style>{styles}</style>
    <Glow x="82%" y="32%" size={1500} delay={0} />
    <Glow x="18%" y="78%" size={1200} color="#F0B27A" warm delay={1800} />
    <Grain />
    <Vignette />

    <div style={stack(0, 900)}>
      <Eyebrow>release notes · v3</Eyebrow>
    </div>

    <div
      style={{
        animation: `au-reveal 1100ms ${EASE} 180ms both`,
      }}
    >
      <Title>
        Quiet,
        <br />
        but built <Serif>for the long run.</Serif>
      </Title>
    </div>

    <div
      style={{
        height: 1,
        width: 96,
        background: 'rgba(255,255,255,0.18)',
        transformOrigin: 'left',
        animation: `au-hairline 900ms ${EASE} 520ms both`,
      }}
    />

    <p
      style={{
        fontFamily: SANS,
        fontSize: 26,
        fontWeight: 400,
        lineHeight: 1.55,
        color: '#A8A29E',
        maxWidth: 920,
        margin: 0,
        letterSpacing: '-0.005em',
        animation: `au-rise 1000ms ${EASE} 620ms both`,
      }}
    >
      Three changes that landed this quarter — none of them flashy, all of them load-bearing.
    </p>

    <Footer pageNum={1} total={TOTAL} />
  </div>
);

const stats = [
  {
    n: '4.2',
    unit: '×',
    label: 'cold start',
    body: 'Server bootstrap is now under a hundred milliseconds.',
  },
  { n: '−38', unit: '%', label: 'memory', body: 'Idle workers shed allocations they never freed.' },
  {
    n: '0',
    unit: '',
    label: 'breaking changes',
    body: 'Every public API from v2 still works, untouched.',
  },
];

const Content: Page = () => (
  <div style={{ ...pageBase, gap: 96 }}>
    <style>{styles}</style>
    <Glow x="14%" y="22%" size={1100} delay={0} />
    <Glow x="92%" y="92%" size={1300} color="#F0B27A" warm delay={1500} />
    <Grain />

    <header style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={stack(0, 900)}>
        <Eyebrow>three measurements</Eyebrow>
      </div>

      <h2
        style={{
          fontFamily: SANS,
          fontSize: 72,
          fontWeight: 500,
          letterSpacing: '-0.028em',
          lineHeight: 1.05,
          margin: 0,
          color: '#FAFAFA',
          maxWidth: 1200,
          animation: `au-reveal 1100ms ${EASE} 160ms both`,
        }}
      >
        Numbers we believed in,
        <br />
        <Serif>then earned.</Serif>
      </h2>
    </header>

    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        columnGap: 56,
        position: 'relative',
      }}
    >
      {stats.map((s, i) => (
        <li
          key={s.label}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            paddingLeft: i === 0 ? 0 : 32,
            borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)',
            animation: `au-rise 1000ms ${EASE} ${380 + i * 140}ms both`,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#A78BFA',
            }}
          >
            {String(i + 1).padStart(2, '0')} — {s.label}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 192,
              fontWeight: 500,
              letterSpacing: '-0.055em',
              lineHeight: 0.88,
              color: '#FAFAFA',
              fontVariantNumeric: 'tabular-nums',
              display: 'inline-flex',
              alignItems: 'baseline',
            }}
          >
            {s.n}
            <span
              style={{
                fontSize: 96,
                color: '#A78BFA',
                marginLeft: 4,
                letterSpacing: '-0.04em',
              }}
            >
              {s.unit}
            </span>
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 19,
              lineHeight: 1.55,
              color: '#A8A29E',
              maxWidth: 360,
            }}
          >
            {s.body}
          </div>
        </li>
      ))}
    </ul>

    <Footer pageNum={2} total={TOTAL} path="~/release-notes/numbers" />
  </div>
);

const Closer: Page = () => (
  <div style={{ ...pageBase, justifyContent: 'center', alignItems: 'flex-start', gap: 44 }}>
    <style>{styles}</style>
    <Glow x="50%" y="50%" size={1700} delay={0} />
    <Glow x="86%" y="20%" size={900} color="#F0B27A" warm delay={1200} />
    <Grain />
    <Vignette />

    <div style={stack(0, 900)}>
      <Eyebrow>get started</Eyebrow>
    </div>

    <div style={{ animation: `au-reveal 1100ms ${EASE} 180ms both` }}>
      <Title>
        Read the docs <Serif>—</Serif>
      </Title>
    </div>

    <div
      style={{
        height: 1,
        width: 96,
        background: 'rgba(255,255,255,0.18)',
        transformOrigin: 'left',
        animation: `au-hairline 900ms ${EASE} 520ms both`,
      }}
    />

    <p
      style={{
        fontSize: 26,
        fontWeight: 400,
        lineHeight: 1.55,
        color: '#A8A29E',
        maxWidth: 920,
        margin: 0,
        letterSpacing: '-0.005em',
        animation: `au-rise 1000ms ${EASE} 620ms both`,
      }}
    >
      Upgrade is one bumped dependency. Everything else can wait until you have time.
    </p>

    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 22px',
        borderRadius: 999,
        border: '1px solid rgba(167,139,250,0.35)',
        background: 'rgba(167,139,250,0.06)',
        color: '#E6DFFD',
        fontFamily: MONO,
        fontSize: 16,
        letterSpacing: '0.04em',
        animation: `au-rise 1000ms ${EASE} 780ms both`,
      }}
    >
      <span style={{ color: '#A78BFA' }}>$</span> npm i @open-slide/core@latest
    </div>

    <Footer pageNum={TOTAL} total={TOTAL} path="~/release-notes/upgrade" />
  </div>
);

export default [Cover, Content, Closer];
