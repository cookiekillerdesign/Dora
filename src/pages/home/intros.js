import { gsap } from '../../lib/smooth'

// Своё появление у каждой главы. Играет один раз, когда лента впервые доезжает до главы.
export function buildIntros(root) {
  const q = (sel) => root.querySelector(sel)
  const tl = () => gsap.timeline({ paused: true })
  const withClip = (t, panel) => {
    const c = q(`${panel} .ep`)
    if (c) t.from(c, { y: 80, rotate: 18, opacity: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0.15)
    return t
  }
  return {
    2: withClip(tl().from(q('[data-stamp]'), { scale: 1.9, rotate: -14, opacity: 0, duration: 0.5, ease: 'back.out(2.4)' }), '.panel--sister'),
    3: withClip(tl().from(q('[data-bounce]'), { yPercent: -120, duration: 1.1, ease: 'bounce.out' }), '.panel--cuterock'),
    4: withClip(tl().from(q('[data-shine]'), { letterSpacing: '0.6em', opacity: 0, duration: 1.4, ease: 'expo.out' }), '.panel--miss'),
    5: withClip(tl().from(q('[data-notify]'), { y: -60, scale: 0.9, opacity: 0, duration: 0.8, ease: 'expo.out' }), '.panel--love'),
    7: withClip(tl(), '.panel--outro'),
    6: withClip(tl().from(root.querySelectorAll('[data-snow]'), { y: -120, opacity: 0, rotate: () => gsap.utils.random(-20, 20), stagger: 0.08, duration: 1.2, ease: 'power2.out' }), '.panel--now'),
    1: withClip(tl().add(() => q('[data-prologue]')?.__play?.()), '.panel--prologue')
  }
}
