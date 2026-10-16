import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })
let lenis = null

export const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouchUI = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches

export function initSmooth() {
  if (lenis) return lenis
  // На телефонах прокрутка остаётся нативной: Lenis там не сглаживает касания,
  // а на iOS лишний слой между пальцем и лентой давал рывки
  if (isTouchUI()) return null
  lenis = new Lenis({ lerp: reduceMotion() ? 1 : 0.09, smoothWheel: !reduceMotion() })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}
export const getLenis = () => lenis
export { gsap, ScrollTrigger }
