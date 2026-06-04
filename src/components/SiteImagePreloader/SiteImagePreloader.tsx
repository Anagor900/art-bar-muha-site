"use client";

import { usePreloadImages } from "@/hooks/usePreloadImages";

type SiteImagePreloaderProps = {
  urls: string[];
};

export function SiteImagePreloader({ urls }: SiteImagePreloaderProps) {
  usePreloadImages(urls);

  return null;
}
