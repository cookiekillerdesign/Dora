import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, reduceMotion } from '../lib/smooth'

// Кастомный курсор: точка точно под мышью и кольцо, которое догоняет её с задержкой.
// Над ссылками и кнопками кольцо растёт; в полях ввода и над плеерами возвращается обычный курсор.
// Только для устройств с мышью; в админке не включается.
export default function Cursor() {
  const dot = useRef(null), ring = useRef(null)
  const { pathname } = useLocation()
  const enabled = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion() && pathname !== '/admin'

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' })
    const setState = (cls, on) => { dot.current?.parentElement.classList.toggle(cls, on) }
    const move = (e) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY)
      const t = e.target
      const native = t.closest?.('input, textarea, select, iframe, [contenteditable="true"]')
      setState('is-native', !!native)
      setState('is-hover', !native && !!t.closest?.('a, button, [role="button"], label, .sticker'))
      setState('is-hidden', false)
    }
    const down = () => setState('is-down', true), up = () => setState('is-down', false)
    const leave = () => setState('is-hidden', true)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down); window.addEventListener('pointerup', up)
    document.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave) // курсор ушёл внутрь iframe плеера
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div className="cursor is-hidden" aria-hidden="true">
      <span className="cursor-ring" ref={ring} />
      <span className="cursor-dot" ref={dot} />
    </div>
  )
}
