"use client";

import { useEffect } from "react";
import { normalizeLocalImageUrls, preloadImages, type PreloadImageResult } from "@/lib/preloadImages";

export function usePreloadImages(
  urls: readonly (string | null | undefined)[],
  onResult?: (result: PreloadImageResult) => void,
) {
  const preloadKey = normalizeLocalImageUrls(urls).join("\u0000");

  useEffect(() => {
    const preloadUrls = preloadKey ? preloadKey.split("\u0000") : [];

    return preloadImages(preloadUrls, onResult);
  }, [preloadKey, onResult]);
}
