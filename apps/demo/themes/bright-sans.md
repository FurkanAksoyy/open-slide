---
name: Bright Sans
description: Editorial luxury product brief — warm-white canvas, oversized Inter Tight display with italic serif accents, hairline-ruled numbered list, restrained four-ink section colours, slow clip-path reveals.
---

# Bright Sans

## Palette

A restrained palette: one near-black ink against a warm-white page, a single editorial blue as the lead accent, and three "section colours" used only as 8 px dots beside an item index — never inside body type, never on a headline.

| Role          | Value                       | Notes                                                          |
| ------------- | --------------------------- | -------------------------------------------------------------- |
| bg            | `#FCFBF7`                   | warm white — a 1° shift off pure white                         |
| text          | `#0F0F10`                   | near-black ink                                                 |
| muted         | `#6B6B70`                   | secondary copy, captions, mono labels                          |
| faint         | `#A4A4A8`                   | tertiary supporting copy                                       |
| hairline      | `rgba(15,15,16,0.08)`       | item dividers, full-width rules                                |
| hairlineSoft  | `rgba(15,15,16,0.04)`       | barely-there rules over surface washes                         |
| ink (lead)    | `#1E40AF`                   | editorial blue — italic-serif accent + lead dot                |
| red           | `#B91C1C`                   | section colour 2                                               |
| ochre         | `#A16207`                   | section colour 3                                               |
| forest        | `#15803D`                   | section colour 4                                               |

A pair of radial washes (blue 5%, ochre 5%) sit at opposite diagonal corners as a barely-visible paper wash — they keep the canvas from feeling clinical.

## Typography

- Display / body font: `'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif` — weights 400 / 500.
- Italic serif accent: `'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif` — italic, weight 400, in `ink` colour. One phrase per headline, never two.
- Mono font: `'JetBrains Mono', 'SF Mono', Menlo, monospace` — eyebrow labels, item index, footer.
- Type scale (1920×1080):
  - Hero title: **176 px**, weight 500, line-height 0.94, letter-spacing -0.04em, `font-feature-settings: "ss01","cv11"`.
  - Page heading: 84 px, weight 500, letter-spacing -0.03em, line-height 1.02.
  - Item title: 44 px, weight 500, letter-spacing -0.022em.
  - Body text: 26–28 px, line-height 1.55.
  - Item body: 21 px.
  - Eyebrow label: 14 px mono, uppercase, letter-spacing 0.22em, in `muted`. Always sits **below** a 1 px × 56 px ink-blue rule.
  - Item index: 16 px mono, tabular-nums, letter-spacing 0.14em (`01`, `02`, `03`, `04`).
  - Footer: 14 px mono, uppercase, letter-spacing 0.14em.

## Layout

- Content padding: **140 px** horizontal, **120 px** vertical.
- Hero pages: vertically centred single-column stack — eyebrow → title → hairline → body. A 120 px hairline rule sits between title and body (a tiny editorial mark).
- Content pages: a 3-column grid for each row — `88px | 1fr | 480px` (index, item title, body). Items are separated by 1 px hairlines top and bottom. **No card shells, no rounded surfaces, no shadows.**
- The lead section colour appears only as an 8 px dot beside the item index. Hover/animation is a gentle 1.15× scale loop.

## Fixed components

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: "'Inter Tight', 'Inter', -apple-system, system-ui, sans-serif",
      fontSize: 176,
      fontWeight: 500,
      lineHeight: 0.94,
      letterSpacing: '-0.04em',
      margin: 0,
      color: '#0F0F10',
      fontFeatureSettings: '"ss01", "cv11"',
    }}
  >
    {children}
  </h1>
);
```

### Serif italic accent

One phrase per heading. Always coloured `ink` (`#1E40AF`).

```tsx
const Serif = ({ children }: { children: React.ReactNode }) => (
  <em
    style={{
      fontFamily: "'Iowan Old Style', 'New York', 'Times New Roman', Georgia, serif",
      fontStyle: 'italic',
      fontWeight: 400,
      letterSpacing: '-0.025em',
      color: '#1E40AF',
    }}
  >
    {children}
  </em>
);
```

### Eyebrow (rule + label)

A 56 px ink-blue rule above an uppercase mono label — replaces the old pill.

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 14 }}>
    <span aria-hidden style={{ height: 1, width: 56, background: '#1E40AF' }} />
    <span
      style={{
        fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
        fontSize: 14,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#6B6B70',
      }}
    >
      {children}
    </span>
  </div>
);
```

### Footer

```tsx
const Footer = ({
  pageNum,
  total,
  label = 'Spring update — 2026',
}: { pageNum: number; total: number; label?: string }) => (
  <div
    style={{
      position: 'absolute',
      left: 140, right: 140, bottom: 64,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
      fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: '#6B6B70',
    }}
  >
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: '#1E40AF' }} />
      {label}
    </span>
    <span style={{ fontVariantNumeric: 'tabular-nums', display: 'inline-flex', gap: 6 }}>
      <span style={{ color: '#0F0F10' }}>{String(pageNum).padStart(2, '0')}</span>
      <span style={{ opacity: 0.4 }}>/</span>
      <span style={{ opacity: 0.5 }}>{String(total).padStart(2, '0')}</span>
    </span>
  </div>
);
```

## Motion

- Philosophy: **slow, deliberate, mask-revealed.** Easing is `cubic-bezier(0.22, 1, 0.36, 1)`. Durations 900–1200 ms. Stagger order on every page: rule → eyebrow → title (clip-path reveal) → hairline (scaleX) → body → items → footer.
- Reusable keyframes:

```css
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
@keyframes bs-dot {
  0%, 100% { transform: scale(1);    }
  50%      { transform: scale(1.15); }
}
```

`bs-mask` is reserved for headings — it reveals type left-to-right like a curtain pull. `bs-line` reveals every rule from its left edge. Footer fades in last (700 ms delay) and never moves.

## Aesthetic

A magazine spread, not a product page. The lede is enormous Inter Tight with one italic serif phrase tucked into it; everything below it is held in place by hairlines and indices. Section colours live as 8 px dots, not pill tags. There are no card shells, no rounded surfaces, no soft shadows — the rhythm of the page is set by full-width 1 px rules and the white space between them. Avoid: rounded card grids, four-colour pill labels, drop shadows, gradients on type, decorative illustration. If the slide could be the opening spread of a yearly product brief from a serious publication, it is on theme.

## Aliases

- `editorial`
- `magazine`
- `light`
