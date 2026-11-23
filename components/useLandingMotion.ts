'use client';
import { useEffect, useRef } from 'react';

export function useLandingMotion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!root || preference.matches || !('IntersectionObserver' in window)) return;
    // Never hide waiting content: the animation is applied only when it enters view.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-landing-revealed', '');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.05 });
    root.querySelectorAll(':scope > section:not(.hero-grid)').forEach(section => observer.observe(section));
    const stop = () => {
      if (preference.matches) observer.disconnect();
    };
    preference.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', stop);
    };
  }, []);
  return ref;
}
