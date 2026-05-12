---
name: Sticker Pop
description: Refined playful editorial — warmer cream canvas, oversized Outfit display with italic serif accents, floating soft confetti blobs, chunky pill stickers with coloured drop shadows, bouncy spring entry.
---

# Sticker Pop

## Palette

Three saturated accents — pink, purple, yellow — and a deep plum ink that holds the page together. The bg is a touch warmer and softer than the original peach so the brights have somewhere to land.

| Role     | Value                          | Notes                                                  |
| -------- | ------------------------------ | ------------------------------------------------------ |
| bg       | `#FAEEDE`                      | warm cream — a half-shade off the old `#fff2e8`        |
| surface  | `#FFF5E8`                      | inset cards (rounded, soft-shadowed)                   |
| cream    | `#FBE9D2`                      | secondary surface, supporting blobs                    |
| ink      | `#2D1B4E`                      | deep plum, primary copy + display                      |
| pink     | `#FF4D8D`                      | lead accent — italic-serif `Made with love`            |
| purple   | `#6D4CFF`                      | secondary accent — italic-serif `tiny`                 |
| yellow   | `#FFD24C`                      | tertiary accent — never on type                        |
| inkSoft  | `rgba(45, 27, 78, 0.10)`       | hairline borders on cards                              |

## Typography

- Display / body font: `'Outfit', 'Inter Tight', 'Inter', system-ui, sans-serif` — weight 800 for display, 500 for body.
- Italic serif accent: `'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif` — italic, weight 400, in pink **or** purple. One accent phrase per heading.
- Mono font: `'JetBrains Mono', 'SF Mono', Menlo, monospace` — footer counters and the closing "the end · for now" line only.
- Type scale (1920×1080):
  - Hero title: **196 px**, weight 800, line-height 0.94, letter-spacing -0.035em.
  - Page heading: 92 px, weight 800, letter-spacing -0.03em.
  - Item number: 88 px, weight 800, tabular-nums, coloured with the item's tone.
  - Body text: 28–30 px, weight 500, line-height 1.45, ink at 86% opacity.
  - Item body: 26 px.
  - Sticker label: 20 px, weight 700, uppercase, letter-spacing 0.1em.
  - Footer counter: 14 px mono, uppercase, letter-spacing 0.18em.

## Layout

- Content padding: **130 px** horizontal, **110 px** vertical.
- Alignment: left, with a small tilt on stickers (`-4°` to `+3°`) and on cards (`±0.5°`) to feel hand-placed without looking sloppy.
- **No black borders, no neo-brutalist offset shadows.** Stickers wear a coloured glow shadow (`0 12px 28px -8px <tone>55`) and a thin ink ghost. Cards get a soft drop shadow (`0 14px 30px -16px rgba(45,27,78,0.18)`) and a 1 px `inkSoft` border.
- Confetti is composed of `Blob` circles — solid pastel fills at 0.4–0.6 opacity that float through `sp-float` on a 7 s ease-in-out loop. One dashed-stroke `Squiggle` orbits silently per page (28 s rotation).
- A 4–8% multiply-blend paper grain SVG sits over the canvas for warmth.

## Fixed components

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: "'Outfit', 'Inter Tight', 'Inter', system-ui, sans-serif",
      fontSize: 196,
      fontWeight: 800,
      lineHeight: 0.94,
      letterSpacing: '-0.035em',
      margin: 0,
      color: '#2D1B4E',
    }}
  >
    {children}
  </h1>
);
```

### Serif italic accent

One phrase per heading. Pink for cover/closer warmth; purple for content punctuation.

```tsx
const Serif = ({ children, color = '#6D4CFF' }: { children: React.ReactNode; color?: string }) => (
  <em
    style={{
      fontFamily: "'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif",
      fontStyle: 'italic',
      fontWeight: 400,
      letterSpacing: '-0.025em',
      color,
    }}
  >
    {children}
  </em>
);
```

### Sticker (chunky pill)

Outline + offset shadow are gone. The new badge wears a coloured halo and a tiny ink bullet.

```tsx
const Sticker = ({
  children,
  tone = 'pink',
  tilt = -3,
}: { children: React.ReactNode; tone?: 'pink' | 'purple' | 'yellow'; tilt?: number }) => {
  const fill = tone === 'purple' ? '#6D4CFF' : tone === 'yellow' ? '#FFD24C' : '#FF4D8D';
  const ink = tone === 'yellow' ? '#2D1B4E' : '#FFF5E8';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: fill, color: ink,
        padding: '12px 22px', borderRadius: 999,
        fontFamily: "'Outfit', 'Inter Tight', 'Inter', system-ui, sans-serif",
        fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        transform: `rotate(${tilt}deg)`,
        boxShadow: `0 12px 28px -8px ${fill}55, 0 2px 0 rgba(45,27,78,0.08)`,
      }}
    >
      <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: ink, opacity: 0.6 }} />
      {children}
    </span>
  );
};
```

### Footer

```tsx
const Footer = ({ pageNum, total }: { pageNum: number; total: number }) => (
  <div
    style={{
      position: 'absolute',
      left: 130, right: 130, bottom: 64,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
      fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: 'rgba(45, 27, 78, 0.55)',
    }}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span aria-hidden style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF4D8D' }} />
      <span aria-hidden style={{ width: 10, height: 10, borderRadius: '50%', background: '#6D4CFF' }} />
      <span aria-hidden style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFD24C' }} />
      <span style={{ marginLeft: 10 }}>Sticker Pop</span>
    </span>
    <span
      style={{
        background: '#2D1B4E', color: '#FFF5E8',
        padding: '8px 16px', borderRadius: 999,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '0.1em',
      }}
    >
      {String(pageNum).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </span>
  </div>
);
```

## Motion

- Philosophy: **layered, springy, but unhurried.** Two easings live side by side:
  - `cubic-bezier(0.22, 1, 0.36, 1)` for headings, body, hairlines (durations 900–1200 ms).
  - `cubic-bezier(0.34, 1.56, 0.64, 1)` for stickers only — the bounce belongs to them.
- Stagger: sticker → title (mask reveal) → body → second sticker → cards (110–150 ms apart) → footer (fades last).
- Reusable keyframes:

```css
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
  0%, 100% { transform: translate(0, 0)       rotate(0deg);  }
  33%      { transform: translate(8px, -12px) rotate(2deg);  }
  66%      { transform: translate(-6px, 6px)  rotate(-2deg); }
}
@keyframes sp-spin {
  0%   { transform: rotate(0deg);   }
  100% { transform: rotate(360deg); }
}
```

## Aesthetic

A risograph zine pulled into a magazine art-direction job. The page still feels playful — three saturated pastels, tilted stickers, soft confetti drifting — but the chrome is dialled down: hard black outlines and harsh offset shadows are replaced with coloured drop shadows that match the sticker's fill, and the type carries one italic serif accent for sophistication. Big numbers, big stickers, plenty of cream around them. Avoid: the old 2 px ink border with 4 px offset shadow, gradients on type, dark mode, photography, decorative emoji that aren't a typographic mark. If the slide could double as the back-cover spread of a small-batch zine printed at a design studio, it is on theme.

## Aliases

- `playful`
- `zine`
- `risograph`
