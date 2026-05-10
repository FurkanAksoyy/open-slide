import type { Page } from '@open-slide/core';
import type { ReactNode } from 'react';

const styles = `
@keyframes mg-fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
`;

const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      fontFamily: "'Geist', 'Inter', -apple-system, system-ui, sans-serif",
      fontSize: 160,
      fontWeight: 800,
      lineHeight: 1.0,
      letterSpacing: '-0.04em',
      margin: 0,
      color: '#ededed',
    }}
  >
    {children}
  </h1>
);

const Footer = ({ pageNum, total }: { pageNum: number; total: number }) => (
  <div
    style={{
      position: 'absolute',
      left: 96,
      right: 96,
      bottom: 56,
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
      fontSize: 13,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#888888',
      borderTop: '1px solid #1f1f1f',
      paddingTop: 18,
    }}
  >
    <span>Mono · Grid</span>
    <span>
      {String(pageNum).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </span>
  </div>
);

const Eyebrow = ({ index, label }: { index: string; label: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#888888',
    }}
  >
    <span style={{ color: '#ededed' }}>{index}</span>
    <span style={{ height: 1, width: 32, background: '#1f1f1f' }} />
    <span>{label}</span>
  </div>
);

const pageBase: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#000000',
  color: '#ededed',
  padding: '80px 96px',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
};

const TOTAL = 3;

const Cover: Page = () => (
  <div
    style={{
      ...pageBase,
      justifyContent: 'flex-end',
      gap: 48,
      animation: 'mg-fadeUp 600ms ease-out both',
    }}
  >
    <style>{styles}</style>
    <Eyebrow index="01" label="opening" />
    <Title>Edge runtime, finally.</Title>
    <p style={{ fontSize: 32, lineHeight: 1.45, color: '#888888', maxWidth: 1280, margin: 0 }}>
      Three constraints we did not compromise on, and the stack we shipped to honour them.
    </p>
    <Footer pageNum={1} total={TOTAL} />
  </div>
);

const Content: Page = () => (
  <div style={{ ...pageBase, gap: 48 }}>
    <style>{styles}</style>
    <Eyebrow index="02" label="constraints" />
    <h2
      style={{
        fontSize: 64,
        fontWeight: 700,
        lineHeight: 1.05,
        letterSpacing: '-0.025em',
        margin: 0,
        color: '#ededed',
        maxWidth: 1280,
      }}
    >
      The three numbers we refused to negotiate.
    </h2>
    <ol
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 32,
        marginTop: 24,
      }}
    >
      {[
        { n: '50ms', label: 'cold start', body: 'Anywhere on the planet, every region.' },
        { n: '0kb', label: 'client runtime', body: 'No framework shipped to the user.' },
        { n: '∞', label: 'concurrent reqs', body: 'Each one isolated, none of them queued.' },
      ].map((m) => (
        <li
          key={m.label}
          style={{
            border: '1px solid #1f1f1f',
            background: '#0a0a0a',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ededed',
              lineHeight: 1,
            }}
          >
            {m.n}
          </div>
          <div
            style={{
              fontSize: 13,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#888888',
            }}
          >
            {m.label}
          </div>
          <div style={{ fontSize: 22, lineHeight: 1.45, color: '#ededed', marginTop: 12 }}>
            {m.body}
          </div>
        </li>
      ))}
    </ol>
    <Footer pageNum={2} total={TOTAL} />
  </div>
);

const Closer: Page = () => (
  <div
    style={{
      ...pageBase,
      justifyContent: 'flex-end',
      gap: 40,
      animation: 'mg-fadeUp 600ms ease-out both',
    }}
  >
    <style>{styles}</style>
    <Eyebrow index="03" label="ship" />
    <Title>Ship it.</Title>
    <p style={{ fontSize: 28, lineHeight: 1.45, color: '#888888', maxWidth: 1100, margin: 0 }}>
      One command. No infrastructure ticket. No pager rotation.
    </p>
    <Footer pageNum={TOTAL} total={TOTAL} />
  </div>
);

export default [Cover, Content, Closer];
