import { gsap } from '../../lib/smooth'

export const PANELS = 8 // обложка + шесть глав + финал

// Лента с остановками: переезд между главами плавно разгоняется и тормозит,
// а на каждой главе есть «пауза», где скролл не двигает ленту.
const MOVE = 1      // длина переезда (в условных единицах скролла)
export const HOLD = 0.7    // длина паузы на главе
const easeMove = gsap.parseEase('power2.inOut')
export const TOTAL = (PANELS - 1) * MOVE + (PANELS - 2) * HOLD
export const arrival = (i) => i * MOVE + (i - 1) * HOLD          // когда лента приезжает на главу i (i >= 1)
export function posAt(p) {
  let t = p * TOTAL
  for (let i = 1; i < PANELS; i++) {
    if (t <= MOVE) return i - 1 + easeMove(Math.max(0, t / MOVE))
    t -= MOVE
    if (i < PANELS - 1) { if (t <= HOLD) return i; t -= HOLD }
  }
  return PANELS - 1
}
// точки доводки: середины пауз, начало и конец
export const SNAPS = [0, ...Array.from({ length: PANELS - 2 }, (_, k) => (arrival(k + 1) + HOLD / 2) / TOTAL), 1]
export const ZONES = Array.from({ length: PANELS - 2 }, (_, k) => [arrival(k + 1) / TOTAL, (arrival(k + 1) + HOLD) / TOTAL])
// Внутри паузы глава стоит на месте. Выехал из паузы: лента доезжает до следующей главы в сторону скролла.
export function snapFor(v, dir) {
  if (v <= 0.002) return 0
  if (v >= 0.998) return 1
  const z = ZONES.findIndex(([a, b]) => v >= a - 0.002 && v <= b + 0.002)
  if (z >= 0) return SNAPS[z + 1]
  const next = SNAPS.find((p) => p > v) ?? 1
  const prev = [...SNAPS].reverse().find((p) => p < v) ?? 0
  return dir < 0 ? prev : next
}
