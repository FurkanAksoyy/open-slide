import { loadSlideImageAssets } from 'virtual:open-slide/assets';

const loaded = new Set<string>();
const pending = new Map<string, Promise<readonly string[]>>();

export async function preloadSlideImages(slideId: string): Promise<void> {
  if (!slideId) return;
  const promise =
    pending.get(slideId) ??
    loadSlideImageAssets(slideId).finally(() => {
      pending.delete(slideId);
    });
  pending.set(slideId, promise);
  let urls: readonly string[];
  try {
    urls = await promise;
  } catch {
    return;
  }
  for (const url of urls) preloadImage(url);
}

function preloadImage(url: string) {
  if (loaded.has(url)) return;
  loaded.add(url);
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
}
