import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export const DESKTOP_BREAKPOINT = 768;

// The static web export has no real browser window, so every page is
// pre-rendered as if the viewport were narrower than the desktop
// breakpoint. Components that read `useWindowDimensions()` directly and
// branch their JSX structure on it (not just style values) mismatch that
// static HTML the instant they hydrate in an actual desktop-width browser
// — React discards and rebuilds the whole subtree (error #418), which is
// exactly why every authenticated route threw a hydration error on first
// load: WebSidebar/WebAppShell/WebMobileNav all swap between structurally
// different children based on this same threshold.
//
// Matching the static render's assumption ("not desktop") for the very
// first client render, then switching to the real value only after mount,
// keeps the hydration pass byte-for-byte consistent and defers the layout
// swap to an ordinary post-mount re-render instead.
export function useResponsiveWidth(): number {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? width : 0;
}

export function useIsDesktop(): boolean {
  return useResponsiveWidth() >= DESKTOP_BREAKPOINT;
}
