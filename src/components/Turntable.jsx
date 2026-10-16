import { useEffect, useRef } from 'react'
import { store } from '../store'
import { reduceMotion } from '../lib/smooth'

const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

function badge(ctx, kind, r) {
  ctx.beginPath()
  if (kind === 2) {
    ctx.moveTo(0, r * 0.75)
    ctx.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.05, 0, -r * 0.4)
    ctx.bezierCurveTo(r * 0.6, -r * 1.05, r * 1.3, -r * 0.1, 0, r * 0.75)
  } else if (kind === 3) {
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, rr = i % 2 ? r * 0.55 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) }
  } else if (kind === 1) {
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.5 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) }
  } else if (kind === 5) {
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) }
  } else if (kind === 0) {
    for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2.1, rr = r * (0.9 + 0.1 * Math.sin(i * 1.7)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) }
  } else {
    ctx.arc(0, 0, r, 0, Math.PI * 2)
  }
}

// Проигрыватель. Крутится только пока играет музыка (playing), плавно разгоняется и тормозит.
// Винил с бороздками рисуется один раз в буфер; в покое анимация полностью останавливается.
export default function Turntable({ era, bpm, title, playing, cover }) {
  const ref = useRef(null)
  const live = useRef({ era, bpm, title, playing, img: null })
  live.current = { ...live.current, era, bpm, title, playing }

  // обложка в центре пластинки: грузим, при смене перерисовываем
  useEffect(() => {
    live.current.img = null
    if (!cover) { kick.current(); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { live.current.img = img; kick.current() }
    img.src = cover
  }, [cover])
  const kick = useRef(() => {})

  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d')
    const disc = document.createElement('canvas'), dctx = disc.getContext('2d')
    let raf = 0, angle = 0, vel = 0, arm = 0, phase = 0, last = performance.now(), W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1
    const still = reduceMotion()

    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = c.getBoundingClientRect()
      W = r.width; H = r.height
      c.width = W * dpr; c.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      R = Math.min(W * 0.4, H * 0.44); cx = W * 0.46; cy = H * 0.5
      // статичный винил: диск, бороздки, тень
      const S = Math.ceil(R * 2.4)
      disc.width = S * dpr; disc.height = S * dpr
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const o = S / 2
      dctx.clearRect(0, 0, S, S)
      dctx.save(); dctx.shadowColor = 'rgba(0,0,0,.45)'; dctx.shadowBlur = R * 0.12; dctx.shadowOffsetY = R * 0.05
      dctx.beginPath(); dctx.arc(o, o, R, 0, Math.PI * 2); dctx.fillStyle = '#0c0c10'; dctx.fill(); dctx.restore()
      for (let rr = R * 0.38; rr < R * 0.98; rr += 3) {
        dctx.beginPath(); dctx.arc(o, o, rr, 0, Math.PI * 2)
        dctx.strokeStyle = `rgba(255,255,255,${0.025 + 0.025 * Math.sin(rr * 0.9)})`; dctx.lineWidth = 1; dctx.stroke()
      }
      draw()
    }

    const draw = () => {
      const { era, title, bpm } = live.current
      const pal = era.palette
      ctx.clearRect(0, 0, W, H)
      // волны вокруг - только когда играет
      if (vel > 0.05) {
        for (let k = 0; k < 3; k++) {
          const p = (phase / 2 + k / 3) % 1
          ctx.beginPath(); ctx.arc(cx, cy, R * (1.02 + p * 0.32), 0, Math.PI * 2)
          ctx.strokeStyle = pal[1]; ctx.globalAlpha = (1 - p) * 0.5 * Math.min(1, vel); ctx.lineWidth = 2; ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
      const S = disc.width / dpr
      ctx.drawImage(disc, cx - S / 2, cy - S / 2, S, S)
      // блик стоит на месте
      ;[-0.75, 2.4].forEach((a) => {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 0.97, a, a + 0.42); ctx.closePath()
        const g = ctx.createRadialGradient(cx, cy, R * 0.35, cx, cy, R)
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,255,255,.09)'); g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g; ctx.fill()
      })
      // этикетка
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle)
      // пульс в такт: нужен и для этикетки, и для подсветки фона, поэтому считаем до ветвления
      const f = phase - Math.floor(phase), pulse = vel > 0.05 ? Math.exp(-f * 5) * vel : 0
      const img = live.current.img
      if (img) {
        // обложка вместо этикетки: круг, кадрированный по центру
        const r = R * 0.34, side = Math.min(img.width, img.height)
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip()
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, -r, -r, r * 2, r * 2)
        ctx.restore()
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; ctx.stroke()
        ctx.beginPath(); ctx.arc(0, 0, R * 0.045, 0, Math.PI * 2); ctx.fillStyle = '#0c0c10'; ctx.fill()
        ctx.restore()
      } else {
      ctx.beginPath(); ctx.arc(0, 0, R * 0.34, 0, Math.PI * 2); ctx.fillStyle = pal[0]; ctx.fill()
      ctx.beginPath(); ctx.arc(0, 0, R * 0.3, 0, Math.PI * 2); ctx.strokeStyle = pal[1]; ctx.lineWidth = 2; ctx.stroke()
      const ink = lum(pal[0]) > 0.6 ? '#1A0A14' : '#ffffff'
      const label = (title || '').toUpperCase() + '  •  '
      ctx.fillStyle = ink; ctx.font = `700 ${Math.max(10, R * 0.05)}px Onest, sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      const step = (Math.PI * 2) / Math.max(label.length, 24)
      for (let i = 0; i < label.length; i++) { ctx.save(); ctx.rotate(i * step); ctx.translate(0, -R * 0.245); ctx.fillText(label[i], 0, 0); ctx.restore() }
      ctx.save(); ctx.scale(1 + pulse * 0.08, 1 + pulse * 0.08)
      badge(ctx, era.idx, R * 0.13)
      if (era.idx === 5) { ctx.strokeStyle = pal[2]; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke() }
      else { ctx.fillStyle = pal[2]; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke() }
      ctx.restore()
      ctx.beginPath(); ctx.arc(0, 0, R * 0.025, 0, Math.PI * 2); ctx.fillStyle = '#0c0c10'; ctx.fill()
      ctx.restore()
      }
      // тонарм: в покое отведён в сторону, при игре опускается на пластинку
      const px = cx + R * 1.05, py = cy - R * 0.82
      const ang = 2.35 - arm * 0.3, len = R * 1.18
      const hx = px + Math.cos(ang) * len, hy = py + Math.sin(ang) * len
      ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(hx, hy); ctx.strokeStyle = '#C9CDD6'; ctx.lineWidth = Math.max(4, R * 0.03); ctx.stroke()
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang + 0.5); ctx.fillStyle = pal[1]; ctx.fillRect(-R * 0.03, -R * 0.06, R * 0.1, R * 0.12); ctx.restore()
      ctx.beginPath(); ctx.arc(px, py, R * 0.085, 0, Math.PI * 2); ctx.fillStyle = '#C9CDD6'; ctx.fill()
      ctx.beginPath(); ctx.arc(px, py, R * 0.04, 0, Math.PI * 2); ctx.fillStyle = '#6d6f78'; ctx.fill()
      store.beat = pulse * 0.5
    }

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now
      const { playing, bpm } = live.current
      const target = playing ? 1 : 0
      vel += (target - vel) * Math.min(1, dt * (playing ? 2.2 : 1.6))   // разгон и торможение
      arm += (target - arm) * Math.min(1, dt * 3)
      if (!still) angle += vel * 0.55 * Math.PI * 2 * dt
      phase += dt * (bpm / 60) * vel
      draw()
      const settled = Math.abs(target - vel) < 0.002 && Math.abs(target - arm) < 0.002
      if (playing || !settled) raf = requestAnimationFrame(loop)
      else { raf = 0; vel = target; arm = target; store.beat = 0; draw() }
    }
    kick.current = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop) } }

    fit()
    const ro = new ResizeObserver(fit); ro.observe(c)
    kick.current()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); store.beat = 0 }
  }, [])

  // смена состояния или трека: дорисовать и, если надо, запустить анимацию
  useEffect(() => { kick.current() }, [playing, era.id, title])

  return <canvas ref={ref} className="turntable" aria-hidden="true" />
}
