---
name: Mono Grid
description: Stark monochrome deck — black canvas, off-white type, surgical grid layouts, single hairline rule.
---

# Mono Grid

## Palette

| Role     | Value     | Notes                                         |
| -------- | --------- | --------------------------------------------- |
| bg       | `#000000` | pure black canvas                             |
| surface  | `#0a0a0a` | optional inset (cards, code blocks)           |
| text     | `#ededed` | off-white, primary copy                       |
| accent   | `#ffffff` | pure white — used for one mark per page       |
| muted    | `#888888` | secondary copy, captions, page numbers        |
| hairline | `#1f1f1f` | dividers and grid lines                       |

## Typography

- Display font: `'Geist', 'Inter', -apple-system, system-ui, sans-serif` — weight 700–800.
- Body font: same — weight 400.
- Type scale:
  - Hero title: 160 px, line-height 1.0, letter-spacing -0.04em.
  - Page heading: 64 px, letter-spacing -0.025em.
  - Body text: 32 px, line-height 1.45.
  - Eyebrow / counter: 13 px, uppercase, letter-spacing 0.12em.

## Layout

- Content padding: 96 px horizontal, 80 px vertical.
- Alignment: left, single column. Headlines hug the left edge; body type stays under `max-width: 1280 px`.
- Grid notes: a single 1 px `hairline` rule under the eyebrow row, 56 px below the page top — every page wears it.

## Fixed components

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
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
```

### Footer

```tsx
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
```

### Eyebrow / counter row

```tsx
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
```

## Motion

- Philosophy: subtle.
- Reusable keyframes:

```css
@keyframes mg-fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Apply `mg-fadeUp` to the hero block only. Body and footer stay still.

## Aesthetic

Surgical, geometric, monochrome — the deck of a developer-tools company that ships in dark mode. Tight letter-spacing, oversized headlines that nearly clip the canvas, one off-white doing all the work. Avoid: gradients, drop shadows, accent colors, decorative emoji, rounded corners larger than 6 px, photography that breaks the grid. If the page could be a `getStaticProps` example, it is on theme.

## Example usage

```tsx
const Cover: Page = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#000000',
      color: '#ededed',
      padding: '80px 96px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      gap: 48,
      animation: 'mg-fadeUp 600ms ease-out both',
    }}
  >
    <Eyebrow index="01" label="opening" />
    <Title>Edge runtime, finally.</Title>
    <p style={{ fontSize: 32, lineHeight: 1.45, color: '#888888', maxWidth: 1280, margin: 0 }}>
      Three constraints we did not compromise on, and the stack we shipped to honour them.
    </p>
    <Footer pageNum={1} total={6} />
  </div>
);
```
