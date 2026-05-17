'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState<boolean>(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQueryList = window.matchMedia(query);
    const update = () => setMatches(mediaQueryList.matches);
    update();
    mediaQueryList.addEventListener('change', update);
    return () => mediaQueryList.removeEventListener('change', update);
  }, [query]);

  return matches;
}
