import { createContext, useContext, useEffect, useRef, useState } from "react";
import { artworkUrls } from "./assets";

export const ArtworkContext = createContext<ReadonlyMap<string, string>>(new Map());

export function useArtwork() {
  const urls = useContext(ArtworkContext);
  return (source: string) => urls.get(source) ?? source;
}

export function useArtworkPreload(attempt: number) {
  const images = useRef(new Map<string, string>());
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const pending = artworkUrls.filter((source) => !images.current.has(source));
    setLoaded(images.current.size);
    setFailed(false);
    let next = 0;

    async function worker() {
      while (!signal.aborted && next < pending.length) {
        const source = pending[next++];
        let url: string | undefined;
        try {
          const response = await fetch(source, {
            signal,
            cache: attempt ? "reload" : "default",
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          url = URL.createObjectURL(await response.blob());
          const image = new Image();
          image.src = url;
          await image.decode();
          if (signal.aborted) return;
          images.current.set(source, url);
          url = undefined;
          setLoaded(images.current.size);
        } catch (error) {
          if (!signal.aborted) {
            console.error(`Artwork failed: ${source}`, error);
            setFailed(true);
          }
        } finally {
          if (url) URL.revokeObjectURL(url);
        }
      }
    }

    for (let i = 0; i < Math.min(6, pending.length); i++) void worker();
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => () => {
    for (const url of images.current.values()) URL.revokeObjectURL(url);
    images.current.clear();
  }, []);

  return { loaded, failed, images: images.current };
}
