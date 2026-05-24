import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { designToCssVars } from './design';
import { SlidePageProvider } from './page-context';
import { waitForDataWaitfor, waitForFonts } from './print-ready';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type SlideModule } from './sdk';

// The pptx geometry maps the 1920×1080 canvas onto a 13.333in × 7.5in
// widescreen slide. That makes 1in = 144px, so positions divide by 144 and
// font/line sizes (points, 72pt = 1in) multiply by 0.5.
const PX_PER_IN = CANVAS_WIDTH / 13.333_333_333;
const SLIDE_W_IN = CANVAS_WIDTH / PX_PER_IN;
const SLIDE_H_IN = CANVAS_HEIGHT / PX_PER_IN;

const inches = (px: number): number => px / PX_PER_IN;
const points = (px: number): number => (px / PX_PER_IN) * 72;

export type PptxExportProgress = {
  phase: 'processing' | 'writing' | 'done';
  current: number;
  total: number;
  percent: number;
};

type TextRun = {
  text: string;
  options: {
    bold?: boolean;
    italic?: boolean;
    underline?: { style: 'sng' };
    strike?: 'sngStrike';
    color?: string;
    fontFace?: string;
    fontSize?: number;
    breakLine?: boolean;
  };
};

const BLOCK_DISPLAYS = new Set([
  'block',
  'flex',
  'grid',
  'list-item',
  'table',
  'table-row',
  'table-cell',
  'flow-root',
  'grid',
]);

export async function exportSlideAsPptx(
  slide: SlideModule,
  slideId: string,
  onProgress?: (progress: PptxExportProgress) => void,
): Promise<void> {
  const pages = slide.default ?? [];
  if (pages.length === 0) return;
  const total = pages.length;

  const { default: PptxGenJs } = await import('pptxgenjs');
  const pptx = new PptxGenJs();
  pptx.defineLayout({ name: 'OPEN_SLIDE', width: SLIDE_W_IN, height: SLIDE_H_IN });
  pptx.layout = 'OPEN_SLIDE';
  pptx.title = slide.meta?.title ?? slideId;

  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  Object.assign(container.style, {
    position: 'fixed',
    left: '-99999px',
    top: '0',
    width: `${CANVAS_WIDTH}px`,
    height: `${CANVAS_HEIGHT}px`,
    pointerEvents: 'none',
  });
  document.body.appendChild(container);

  const designVars = slide.design ? designToCssVars(slide.design) : null;

  onProgress?.({ phase: 'processing', current: 0, total, percent: 0 });

  try {
    await waitForFonts();
    for (let i = 0; i < pages.length; i++) {
      const Page = pages[i];
      if (!Page) continue;

      const host = document.createElement('div');
      host.setAttribute('data-osd-canvas', '');
      Object.assign(host.style, {
        width: `${CANVAS_WIDTH}px`,
        height: `${CANVAS_HEIGHT}px`,
        position: 'relative',
        overflow: 'hidden',
      });
      if (designVars) {
        for (const [k, v] of Object.entries(designVars)) host.style.setProperty(k, v);
      }
      container.appendChild(host);

      const root: Root = createRoot(host);
      root.render(
        createElement(SlidePageProvider, { index: i, total: pages.length }, createElement(Page)),
      );

      // Two paints so React commits and CSS intro animations have started; we
      // skip waiting for them to finish and capture the final (post-animation)
      // styles instead, since pptx can't represent motion.
      await nextPaint();
      await nextPaint();
      await waitForDataWaitfor(host);
      freezeAnimations(host);
      await nextPaint();

      const pptxSlide = pptx.addSlide();
      await buildSlide(pptx, pptxSlide, host);

      root.unmount();
      container.removeChild(host);

      onProgress?.({
        phase: 'processing',
        current: i + 1,
        total,
        percent: Math.min(95, ((i + 1) / total) * 95),
      });
    }

    onProgress?.({ phase: 'writing', current: total, total, percent: 97 });
    const blob = (await pptx.write({ outputType: 'blob' })) as Blob;
    downloadBlob(blob, `${slideId}.pptx`);
  } finally {
    onProgress?.({ phase: 'done', current: total, total, percent: 100 });
    container.remove();
  }
}

type PptxInstance = InstanceType<typeof import('pptxgenjs').default>;
type PptxSlide = ReturnType<PptxInstance['addSlide']>;

async function buildSlide(pptx: PptxInstance, slide: PptxSlide, host: HTMLElement): Promise<void> {
  const origin = host.getBoundingClientRect();

  const rootBg = parseColor(getComputedStyle(host).backgroundColor);
  if (rootBg && rootBg.a > 0.01) {
    slide.background = { color: rootBg.hex };
  } else {
    slide.background = { color: 'FFFFFF' };
  }

  // Image work is async; collect ops in DOM order, then run sequentially so
  // shapes keep their stacking order in the final deck.
  const ops: Array<() => void | Promise<void>> = [];
  walk(host, origin, host, slide, pptx, ops);
  for (const op of ops) await op();
}

function walk(
  el: HTMLElement,
  origin: DOMRect,
  host: HTMLElement,
  slide: PptxSlide,
  pptx: PptxInstance,
  ops: Array<() => void | Promise<void>>,
): void {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return;
  if (Number(style.opacity) === 0) return;

  const rect = el.getBoundingClientRect();
  const box = {
    x: inches(rect.left - origin.left),
    y: inches(rect.top - origin.top),
    w: inches(rect.width),
    h: inches(rect.height),
  };
  const hasArea = rect.width > 0.5 && rect.height > 0.5;

  if (el !== host && hasArea) {
    emitBoxDecoration(style, box, slide, pptx);
  }

  const tag = el.tagName.toLowerCase();

  if (tag === 'img') {
    const img = el as HTMLImageElement;
    if (hasArea && img.currentSrc) {
      ops.push(async () => {
        const data = await toDataUrl(img.currentSrc);
        if (data) slide.addImage({ data, ...box });
      });
    }
    return;
  }

  if (tag === 'svg') {
    if (hasArea) {
      ops.push(async () => {
        const data = await rasterizeSvg(el as unknown as SVGSVGElement, rect.width, rect.height);
        if (data) slide.addImage({ data, ...box });
      });
    }
    return;
  }

  if (tag === 'canvas') {
    if (hasArea) {
      try {
        const data = (el as HTMLCanvasElement).toDataURL('image/png');
        ops.push(() => {
          slide.addImage({ data, ...box });
        });
      } catch {}
    }
    return;
  }

  if (isTextLeaf(el)) {
    emitText(el, style, slide, origin, ops);
    return;
  }

  for (const child of Array.from(el.children)) {
    if (child instanceof HTMLElement || child instanceof SVGElement) {
      walk(child as HTMLElement, origin, host, slide, pptx, ops);
    }
  }
}

function emitBoxDecoration(
  style: CSSStyleDeclaration,
  box: { x: number; y: number; w: number; h: number },
  slide: PptxSlide,
  pptx: PptxInstance,
): void {
  const bg = parseColor(style.backgroundColor);
  const border = parseBorder(style);
  if ((!bg || bg.a <= 0.01) && !border) return;

  const radius = Math.max(
    parseFloat(style.borderTopLeftRadius) || 0,
    parseFloat(style.borderTopRightRadius) || 0,
  );
  const shapeType = radius > 1 ? pptx.ShapeType.roundRect : pptx.ShapeType.rect;

  const options: Record<string, unknown> = { ...box };
  if (bg && bg.a > 0.01) {
    options.fill = { color: bg.hex, transparency: Math.round((1 - bg.a) * 100) };
  } else {
    options.fill = { type: 'none' };
  }
  if (border) {
    options.line = { color: border.hex, width: border.width };
  }
  if (shapeType === pptx.ShapeType.roundRect) {
    // pptx rectRadius is a fraction of the shorter side.
    const shorter = Math.min(box.w, box.h) * PX_PER_IN;
    options.rectRadius = Math.min(0.5, radius / Math.max(1, shorter)) * Math.min(box.w, box.h);
  }
  slide.addShape(shapeType, options);
}

function emitText(
  el: HTMLElement,
  style: CSSStyleDeclaration,
  slide: PptxSlide,
  origin: DOMRect,
  ops: Array<() => void>,
): void {
  const runs = collectRuns(el);
  if (runs.length === 0) return;

  // Range bounds give the actual rendered text box (tight around the glyphs),
  // which positions correctly regardless of flex/grid centering on the element.
  const range = document.createRange();
  range.selectNodeContents(el);
  const bbox = range.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const rect = bbox.width >= 1 && bbox.height >= 1 ? bbox : elRect;

  const fontSizePx = parseFloat(style.fontSize) || 16;
  let lineHeightPx = parseFloat(style.lineHeight);
  if (!Number.isFinite(lineHeightPx)) lineHeightPx = fontSizePx * 1.2;
  const align = mapTextAlign(style.textAlign);

  // PowerPoint's font metrics run slightly wider than the browser's, so a box
  // sized to the exact text width re-wraps a word onto a new line. For text
  // the browser kept on one line, disable wrapping entirely. For genuinely
  // wrapped text, size the box to the element's content width so PowerPoint
  // breaks at the same place the browser did.
  const singleLine = rect.height <= lineHeightPx * 1.4;
  const isInline = style.display.startsWith('inline') && style.display !== 'inline-block';

  let x: number;
  let w: number;
  let wrap: boolean;
  if (singleLine || isInline) {
    x = inches(rect.left - origin.left);
    w = inches(rect.width) + 0.12;
    wrap = !singleLine;
  } else {
    const padL = parseFloat(style.paddingLeft) || 0;
    const padR = parseFloat(style.paddingRight) || 0;
    const borderL = parseFloat(style.borderLeftWidth) || 0;
    const contentLeft = elRect.left + borderL + padL;
    const contentWidth = el.clientWidth - padL - padR;
    x = inches(contentLeft - origin.left);
    w = inches(contentWidth > 1 ? contentWidth : rect.width) + 0.04;
    wrap = true;
  }

  ops.push(() => {
    slide.addText(runs, {
      x,
      y: inches(rect.top - origin.top),
      w,
      h: inches(rect.height) + 0.08,
      align,
      valign: 'top',
      margin: 0,
      lineSpacing: points(lineHeightPx),
      wrap,
      autoFit: false,
    });
  });
}

function isTextLeaf(el: HTMLElement): boolean {
  if (!el.textContent?.trim()) return false;
  for (const child of Array.from(el.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (!child.textContent?.trim()) continue;
    const d = getComputedStyle(child).display;
    if (BLOCK_DISPLAYS.has(d)) return false;
  }
  return true;
}

function collectRuns(el: HTMLElement): TextRun[] {
  const runs: TextRun[] = [];
  let pendingBreak = false;

  const visit = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.textContent ?? '';
      const text = raw.replace(/\s+/g, ' ');
      if (!text.trim() && !text) return;
      const parent = node.parentElement;
      if (!parent) return;
      const ps = getComputedStyle(parent);
      runs.push({
        text,
        options: {
          ...runStyle(ps),
          ...(pendingBreak ? { breakLine: true } : {}),
        },
      });
      pendingBreak = false;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const childEl = node as HTMLElement;
    if (childEl.tagName.toLowerCase() === 'br') {
      pendingBreak = true;
      return;
    }
    const cs = getComputedStyle(childEl);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    for (const child of Array.from(childEl.childNodes)) visit(child);
  };

  for (const child of Array.from(el.childNodes)) visit(child);

  // Trim leading/trailing whitespace-only runs.
  while (runs.length && !runs[0].text.trim()) runs.shift();
  while (runs.length && !runs[runs.length - 1].text.trim()) runs.pop();
  return runs;
}

function runStyle(cs: CSSStyleDeclaration): TextRun['options'] {
  const weight = Number(cs.fontWeight);
  const color = parseColor(cs.color);
  const decoration = cs.textDecorationLine || cs.textDecoration;
  return {
    bold: Number.isFinite(weight) ? weight >= 600 : cs.fontWeight === 'bold',
    italic: cs.fontStyle === 'italic',
    underline: decoration?.includes('underline') ? { style: 'sng' } : undefined,
    strike: decoration?.includes('line-through') ? 'sngStrike' : undefined,
    color: color?.hex ?? '000000',
    fontFace: primaryFontFamily(cs.fontFamily),
    fontSize: points(parseFloat(cs.fontSize) || 16),
  };
}

function mapTextAlign(value: string): 'left' | 'center' | 'right' | 'justify' {
  if (value === 'center') return 'center';
  if (value === 'right' || value === 'end') return 'right';
  if (value === 'justify') return 'justify';
  return 'left';
}

function primaryFontFamily(family: string): string {
  const first = family.split(',')[0]?.trim() ?? '';
  return first.replace(/^["']|["']$/g, '') || 'Arial';
}

function parseBorder(style: CSSStyleDeclaration): { hex: string; width: number } | null {
  const w = parseFloat(style.borderTopWidth);
  if (!Number.isFinite(w) || w <= 0) return null;
  if (style.borderTopStyle === 'none' || style.borderTopStyle === 'hidden') return null;
  const color = parseColor(style.borderTopColor);
  if (!color || color.a <= 0.01) return null;
  return { hex: color.hex, width: Math.max(0.25, points(w)) };
}

function parseColor(value: string | null): { hex: string; a: number } | null {
  if (!value) return null;
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
  const [r, g, b] = parts;
  const a = parts.length >= 4 ? parts[3] : 1;
  if (![r, g, b].every(Number.isFinite)) return null;
  return { hex: toHex(r, g, b), a };
}

function toHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

function freezeAnimations(root: HTMLElement): void {
  if (typeof document.getAnimations !== 'function') return;
  for (const anim of document.getAnimations()) {
    const target = (anim.effect as KeyframeEffect | null)?.target;
    if (target && root.contains(target)) {
      try {
        anim.finish();
      } catch {}
    }
  }
}

async function toDataUrl(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function rasterizeSvg(
  svg: SVGSVGElement,
  width: number,
  height: number,
): Promise<string | null> {
  try {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    const serialized = new XMLSerializer().serializeToString(clone);
    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
    const img = await loadImage(svgUrl);
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
