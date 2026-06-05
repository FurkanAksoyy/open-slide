import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { STANDALONE_SLIDE_ID } from '../../editing/slide-ops.ts';
import { resolveSlidePath } from './context.ts';

describe('resolveSlidePath', () => {
  it('resolves <userCwd>/<slidesDir>/<id>/index.tsx in workspace mode', () => {
    expect(resolveSlidePath('/repo', 'slides', 'cover')).toBe(
      path.resolve('/repo', 'slides', 'cover', 'index.tsx'),
    );
  });

  it('rejects invalid ids', () => {
    expect(resolveSlidePath('/repo', 'slides', '../escape')).toBeNull();
  });

  it('maps the synthetic id to the root index.tsx in standalone mode', () => {
    expect(resolveSlidePath('/repo', 'slides', STANDALONE_SLIDE_ID, 'standalone')).toBe(
      path.join('/repo', 'index.tsx'),
    );
  });

  it('rejects any other id in standalone mode', () => {
    expect(resolveSlidePath('/repo', 'slides', 'cover', 'standalone')).toBeNull();
  });
});
