'use client';

import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

const READY_CLASS = 'reveal-ready';
const REVEALED_CLASS = 'in';

/**
 * Adds the `.in` class to every `.reveal` descendant of the returned ref's
 * element once it enters the viewport. The container gets `.reveal-ready`
 * only after mount, so content stays visible if JS never runs. With
 * `prefers-reduced-motion: reduce` everything is revealed without observing.
 */
export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>('.reveal');
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add(REVEALED_CLASS));
      return;
    }

    container.classList.add(READY_CLASS);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(REVEALED_CLASS);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      container.classList.remove(READY_CLASS);
    };
  }, []);

  return containerRef;
}
