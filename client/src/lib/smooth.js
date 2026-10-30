import Lenis from 'lenis';

let lenis = null;
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startSmooth() {
  if (lenis || reduce()) return lenis;
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  const raf = (time) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}

export function stopSmooth() {
  lenis?.destroy();
  lenis = null;
}

export function scrollToTarget(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.4, ...opts });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (typeof target === 'number') window.scrollTo({ top: target, behavior: opts.immediate ? 'auto' : 'smooth' });
    else el?.scrollIntoView({ behavior: 'smooth' });
  }
}

export const lockScroll = (on) => {
  if (on) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = on ? 'hidden' : '';
};
