import { gsap, reduceMotion } from './smooth'

const SHAPES = {
  heart: '<svg viewBox="0 0 40 36"><path d="M20 34S2 22 2 11A9 9 0 0 1 20 7a9 9 0 0 1 18 4c0 11-18 23-18 23z"/></svg>',
  star: '<svg viewBox="0 0 40 40"><path d="M20 0c2 12 8 18 20 20-12 2-18 8-20 20-2-12-8-18-20-20 12-2 18-8 20-20z"/></svg>'
}

// Разлёт частиц из точки (x, y) в координатах контейнера
export function burst(container, x, y, { shape = 'heart', colors = ['#E0103A'], count = 10, spread = 120, size = [14, 26] } = {}) {
  if (!container || reduceMotion()) return
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span')
    el.className = 'fx-p'
    el.innerHTML = SHAPES[shape]
    el.style.color = colors[i % colors.length]
    const s = gsap.utils.random(size[0], size[1])
    el.style.width = el.style.height = s + 'px'
    el.style.left = x - s / 2 + 'px'; el.style.top = y - s / 2 + 'px'
    container.appendChild(el)
    const a = (i / count) * Math.PI * 2 + gsap.utils.random(-0.3, 0.3)
    const d = gsap.utils.random(spread * 0.5, spread)
    gsap.timeline({ onComplete: () => el.remove() })
      .fromTo(el, { scale: 0, rotate: gsap.utils.random(-40, 40) },
        { x: Math.cos(a) * d, y: Math.sin(a) * d - 20, scale: 1, rotate: gsap.utils.random(-90, 90), duration: 0.55, ease: 'power3.out' })
      .to(el, { y: '+=60', opacity: 0, scale: 0.6, duration: 0.6, ease: 'power2.in' }, '>-0.05')
  }
}

// След из страз за курсором
export function sparkleTrail(container, { colors = ['#fff'], every = 45, max = 28, perMove = 1, size = [8, 20] } = {}) {
  if (!container || reduceMotion()) return () => {}
  let lastT = 0, alive = 0
  const move = (e) => {
    if (e.pointerType !== 'mouse') return // пальцем листают, а не рисуют
    const now = performance.now()
    if (now - lastT < every || alive >= max) return
    lastT = now
    const r = container.getBoundingClientRect()
    for (let k = 0; k < perMove && alive < max; k++) {
      const el = document.createElement('span')
      el.className = 'fx-p fx-spark'
      el.innerHTML = SHAPES.star
      el.style.color = colors[Math.floor(Math.random() * colors.length)]
      const s = gsap.utils.random(size[0], size[1])
      el.style.width = el.style.height = s + 'px'
      el.style.left = e.clientX - r.left - s / 2 + gsap.utils.random(-14, 14) + 'px'
      el.style.top = e.clientY - r.top - s / 2 + gsap.utils.random(-14, 14) + 'px'
      container.appendChild(el); alive++
      gsap.timeline({ onComplete: () => { el.remove(); alive-- } })
        .fromTo(el, { scale: 0, rotate: 0 }, { scale: 1, rotate: 90, duration: 0.25, ease: 'back.out(3)' })
        .to(el, { scale: 0, rotate: 180, y: gsap.utils.random(10, 50), x: gsap.utils.random(-30, 30), duration: gsap.utils.random(0.6, 1.1), ease: 'power2.in' })
    }
  }
  container.addEventListener('pointermove', move)
  return () => container.removeEventListener('pointermove', move)
}
