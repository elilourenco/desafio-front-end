'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Check if window is available (for SSR compatibility)
    if (typeof window === 'undefined') {
      setIsMobile(false);
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Set initial value
    setIsMobile(mql.matches);

    // Add event listener
    mql.addEventListener('change', onChange);

    // Cleanup
    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, []);

  return !!isMobile;
}