export type PreloadImageResult = {
  status: "loaded" | "error";
  url: string;
};

const localImagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

export function normalizeLocalImageUrls(urls: readonly (string | null | undefined)[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  urls.forEach((rawUrl) => {
    const url = rawUrl?.trim();

    if (!url || !url.startsWith("/") || url.startsWith("//") || !localImagePattern.test(url)) {
      return;
    }

    if (seen.has(url)) {
      return;
    }

    seen.add(url);
    result.push(url);
  });

  return result;
}

export function preloadImages(
  urls: readonly (string | null | undefined)[],
  onResult?: (result: PreloadImageResult) => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  let cancelled = false;
  const images: HTMLImageElement[] = [];

  normalizeLocalImageUrls(urls).forEach((url) => {
    const image = new window.Image();

    image.decoding = "async";
    image.onload = () => {
      if (!cancelled) {
        onResult?.({ status: "loaded", url });
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        onResult?.({ status: "error", url });
      }
    };
    image.src = url;
    images.push(image);
  });

  return () => {
    cancelled = true;
    images.forEach((image) => {
      image.onload = null;
      image.onerror = null;
    });
  };
}
