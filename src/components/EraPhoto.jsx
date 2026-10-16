import { useEffect, useRef } from 'react'
import { gsap, reduceMotion } from '../lib/smooth'
import { tr } from '../lib/tr'

// Обобщённый силуэт для заглушки, пока нет настоящего фото (не портрет)
function Silhouette() {
  return (
    <svg viewBox="0 0 200 240" className="ep-sil" aria-hidden="true">
      <circle cx="100" cy="62" r="30" />
      <path d="M62 54c-6-26 22-44 44-36 26-6 46 20 34 42 8 18 0 40-10 46l-6-30c-10 10-36 10-50 0l-6 28c-12-8-14-34-6-50z" />
      <path d="M58 240c0-60 10-104 42-110 32 6 42 50 42 110z" />
      <path className="ep-sil-guitar" d="M40 196c-10-20 6-40 24-36l60-48 8 8-50 58c8 16-4 40-26 36-8-2-14-8-16-18z" />
    </svg>
  )
}


// Фото главы в подаче своей эпохи. Рамка мягко наклоняется за курсором.
export default function EraPhoto({ era, variant, photo = {}, lang = 'ru', placeholder, className = '' }) {
  const v = variant || era.id
  const ref = useRef(null)
  const inner = useRef(null)
  const caption = tr(photo.caption, lang)
  const alt = caption || `Дора, ${era.year}`

  useEffect(() => {
    const el = ref.current
    if (!el || reduceMotion() || !window.matchMedia('(pointer: fine)').matches) return
    const rx = gsap.quickTo(inner.current, 'rotationX', { duration: 0.6, ease: 'power3' })
    const ry = gsap.quickTo(inner.current, 'rotationY', { duration: 0.6, ease: 'power3' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5
      ry(px * 16); rx(-py * 16)
      el.style.setProperty('--mx', `${(px + 0.5) * 100}%`)
      el.style.setProperty('--my', `${(py + 0.5) * 100}%`)
    }
    const leave = () => { rx(0); ry(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [])

  // на тач-устройствах эффект наведения запускается тапом
  const poke = () => {
    const el = ref.current
    el.classList.remove('is-poked'); void el.offsetWidth; el.classList.add('is-poked')
  }

  return (
    <figure ref={ref} className={`ep ep--${v} ${className}`} onPointerDown={poke}>
      <div ref={inner} className="ep-inner">
        {v === 'prologue' && <><span className="ep-tape ep-tape--l" /><span className="ep-tape ep-tape--m" /><span className="ep-tape ep-tape--r" /></>}
        {v === 'strip' && <span className="ep-tape ep-tape--strip" />}
        {v === 'sister' && <span className="ep-staples" aria-hidden="true" />}
        {(v === 'lovesongs' || v === 'snap') && <span className="ep-pin" aria-hidden="true" />}
        {v === 'miss' && <span className="ep-gems" aria-hidden="true"><i /><i /><i /><i /></span>}
        {v === 'outro' ? (
          <div className="ep-strip">
            {[[photo.src, '50% 18%'], [photo.strip2, '50% 40%'], [photo.strip3, '50% 62%']].map(([own, pos], i) => {
              // свой кадр - по центру; пустой кадр повторяет первый со своим кадрированием
              const src = own || photo.src
              return (
              <div className="ep-media" key={i}>
                {src
                  ? <img src={src} alt={i === 0 ? alt : ''} loading="lazy" decoding="async" draggable="false" style={{ objectPosition: own && i > 0 ? '50% 35%' : pos }} />
                  : <div className="ep-ph" role={i === 0 ? 'img' : undefined} aria-label={i === 0 ? alt : undefined}><Silhouette /></div>}
                <span className="ep-fx" aria-hidden="true" />
              </div>
            )})}
          </div>
        ) : <div className="ep-media">
          {photo.src
            ? <img src={photo.src} alt={alt} loading="lazy" decoding="async" draggable="false" style={{ objectPosition: photo.pos || '50% 30%' }} />
            : <div className="ep-ph" role="img" aria-label={alt}><Silhouette /></div>}
          <span className="ep-fx" aria-hidden="true" />
        </div>}
      </div>
    </figure>
  )
}
