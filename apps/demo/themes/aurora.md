---
name: Aurora
description: Cinematic late-night editorial — pitch-black canvas, dual violet/amber blooms, oversized sans display with italic serif accents, hairline composition, slow blur-reveal motion.
---

# Aurora

## Palette

| Role        | Value                          | Notes                                                              |
| ----------- | ------------------------------ | ------------------------------------------------------------------ |
| bg          | `#070707`                      | true near-black canvas                                             |
| text        | `#FAFAFA`                      | primary copy                                                       |
| muted       | `#A8A29E`                      | secondary copy, supporting lines                                   |
| faint       | `#737373`                      | footer, captions, counters                                         |
| hairline    | `rgba(255,255,255,0.07)`       | vertical / horizontal rules — visible only on close inspection     |
| surfaceSoft | `rgba(255,255,255,0.025)`      | eyebrow pill backdrop (blurred glass)                              |
| accent      | `#A78BFA`                      | violet — primary light source, dots, single-mark per page          |
| accentText  | `#E6DFFD`                      | italic serif accents and CTA ink                                   |
| accentWarm  | `#F0B27A`                      | secondary amber light — never on type, only as a glow              |

## Typography

- Display / body font: `-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', system-ui, sans-serif` — weights 400 / 500.
- Italic accent font: `'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif` — italic, weight 400, used for one phrase or em-dash per heading.
- Mono font: `'SF Mono', 'JetBrains Mono', 'Menlo', monospace` — paths, indices, eyebrows, footer.
- Type scale (1920×1080):
  - Hero title: **168 px**, weight 500, line-height 0.95, letter-spacing -0.035em, `font-feature-settings: "ss01","cv11"`.
  - Page heading: 72 px, weight 500, letter-spacing -0.028em.
  - Stat number: **192 px**, weight 500, tabular-nums, letter-spacing -0.055em. Stat unit (`×`, `%`): 96 px, accent colour.
  - Body text: 26 px, line-height 1.55, letter-spacing -0.005em.
  - Small body / card copy: 19 px.
  - Eyebrow / tag: 15 px, mono, uppercase, letter-spacing 0.22em.
  - Stat index / label: 13 px mono, uppercase, letter-spacing 0.22em, accent colour.
  - Footer: 18 px mono, letter-spacing 0.06em.

## Layout

- Content padding: **140 px** horizontal, **120 px** vertical.
- Composition: cover and closer left-align a single stack (eyebrow → title → hairline → subtitle); the interior page splits header from a three-column stat row separated by vertical hairlines rather than card shells.
- **No card boxes.** Borders are 1 px at `rgba(255,255,255,0.07)`; they divide, they don't contain.
- A 96 px hairline (`height: 1, width: 96, background: rgba(255,255,255,0.18)`) sits between title and body on cover/closer — a small "rule" that signals editorial restraint.
- Glow: two off-centre radial blooms per page — a primary violet (~1400 px, opacity 0.42→0.72) and a secondary warm amber (~1200 px, opacity 0.18→0.36) with a phase offset. Glows are pushed to opposite corners so they never sit behind type.
- A 5% SVG fractal-noise grain layer (mix-blend `screen`) sits over the whole canvas. A bottom-anchored elliptical vignette deepens the floor.

## Fixed components

### Title (display)

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', system-ui, sans-serif",
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
```

### Serif italic accent

Use `<Serif>` for one phrase or punctuation mark per headline — never two:

```tsx
const Serif = ({ children }: { children: React.ReactNode }) => (
  <em
    style={{
      fontFamily: "'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif",
      fontStyle: 'italic',
      fontWeight: 400,
      letterSpacing: '-0.025em',
      color: '#E6DFFD',
    }}
  >
    {children}
  </em>
);
```

### Footer

```tsx
const Footer = ({
  pageNum,
  total,
  path = '~/release-notes',
}: { pageNum: number; total: number; path?: string }) => (
  <div
    style={{
      position: 'absolute',
      left: 140, right: 140, bottom: 64,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
      fontSize: 18, letterSpacing: '0.06em', color: '#737373',
    }}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 8px #A78BFA' }} />
      <span>{path}</span>
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ color: '#FAFAFA', fontVariantNumeric: 'tabular-nums' }}>{String(pageNum).padStart(2, '0')}</span>
      <span style={{ opacity: 0.35 }}>—</span>
      <span style={{ opacity: 0.5, fontVariantNumeric: 'tabular-nums' }}>{String(total).padStart(2, '0')}</span>
    </span>
  </div>
);
```

### Eyebrow (glass pill)

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 14,
      padding: '9px 18px 9px 14px',
      borderRadius: 999,
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.025)',
      backdropFilter: 'blur(8px)',
      fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
      fontSize: 15, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#A8A29E',
    }}
  >
    <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA', animation: 'au-dot 2.6s ease-in-out infinite' }} />
    {children}
  </div>
);
```

## Motion

- Philosophy: **slow, layered, cinematic.** Easing is always `cubic-bezier(0.16, 1, 0.3, 1)`. Durations 900–1100 ms. Elements stagger by 80–180 ms in this order: eyebrow → title (blur-reveal) → hairline (scaleX) → body → CTA → footer.
- Reusable keyframes:

```css
@keyframes au-reveal {
  0%   { opacity: 0; transform: translateY(28px); filter: blur(8px); }
  100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
}
@keyframes au-rise {
  0%   { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes au-hairline {
  0%   { transform: scaleX(0); opacity: 0; }
  100% { transform: scaleX(1); opacity: 1; }
}
@keyframes au-glow {
  0%, 100% { opacity: 0.42; transform: translate(-50%, -50%) scale(1);    }
  50%      { opacity: 0.72; transform: translate(-50%, -50%) scale(1.06); }
}
@keyframes au-glow-warm {
  0%, 100% { opacity: 0.18; transform: translate(-50%, -50%) scale(1);    }
  50%      { opacity: 0.36; transform: translate(-50%, -50%) scale(1.08); }
}
@keyframes au-dot {
  0%, 100% { box-shadow: 0 0 12px #A78BFA, 0 0 0 0 rgba(167,139,250,0); }
  50%      { box-shadow: 0 0 22px #A78BFA, 0 0 0 6px rgba(167,139,250,0.08); }
}
```

`au-reveal` is reserved for the hero title (blur-out feels deliberate, not flashy). `au-rise` carries everything else. The two glows run on 7 s loops with a 1.2–1.8 s phase offset so the canvas breathes asymmetrically.

## Aesthetic

A late-night editorial spread bound between two soft light sources. The page reads top-down: a small mono tag, an oversized sans display with one italic serif phrase, a hairline rule, a quiet line of body copy. Numbers, when they appear, are enormous and tabular — set against vertical hairlines that imply a column, not a card. Everything else falls away: no rounded shells, no drop shadows, no second accent on type. The two light sources (violet, amber) live in opposite corners and pulse against one another; the grain keeps the black from looking flat. Avoid: light backgrounds, multi-colour body text, more than one Serif phrase per heading, card shells with drop shadows, animation under 700 ms.

## Aliases

- `dark`
- `editorial-dark`
- `cinematic`
