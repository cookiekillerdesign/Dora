import { gsap, reduceMotion, isTouchUI } from '../../lib/smooth'
import { snapFor } from './tape'

// Доводка ленты до главы колесом и тачпадом. Срабатывает, когда прокрутка по-настоящему
// остановилась: 220 мс без ввода и движения и Lenis сам ничего не прокручивает.
// На сенсорных экранах выключена: на iOS после отпускания пальца страница едет по инерции,
// и программная доводка спорила бы с ней. Паузы на главах заложены в саму механику ленты.
// Возвращает функцию отключения.
export function attachSnapper(lenis, scrollTrigger) {
  if (!lenis || reduceMotion() || isTouchUI()) return () => {}
  const st = scrollTrigger
  let last = performance.now(), dir = 1, snapping = false, settled = false, guard

  const offScroll = lenis.on('scroll', () => { if (!snapping) { last = performance.now(); settled = false } })
  const offInput = lenis.on('virtual-scroll', ({ deltaY }) => {
    if (deltaY) dir = deltaY > 0 ? 1 : -1
    snapping = false; settled = false; last = performance.now()
  })

  const tick = () => {
    if (snapping || settled) return
    if (lenis.isScrolling) { last = performance.now(); return } // Lenis ещё ведёт прокрутку
    if (performance.now() - last < 220) return
    const y = window.scrollY, len = st.end - st.start
    if (len <= 0 || y < st.start - 2 || y > st.end + 2) { settled = true; return }
    const target = st.start + snapFor((y - st.start) / len, dir) * len
    if (Math.abs(target - y) < 2) { settled = true; return }
    snapping = true
    const duration = Math.min(0.9, Math.max(0.35, Math.abs(target - y) / 2200))
    clearTimeout(guard)
    guard = setTimeout(() => { snapping = false }, duration * 1000 + 400) // страховка, если onComplete не придёт
    lenis.scrollTo(target, { duration, easing: (t) => 1 - Math.pow(1 - t, 3), onComplete: () => { snapping = false; settled = true } })
  }
  gsap.ticker.add(tick)

  return () => { gsap.ticker.remove(tick); clearTimeout(guard); offScroll?.(); offInput?.() }
}
