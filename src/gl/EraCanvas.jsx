import { useEffect, useRef, useState } from 'react'
import { store } from '../store'
import { vert, frag } from './shader'
import { reduceMotion } from '../lib/smooth'

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src); gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null }
  return s
}

function GLCanvas({ onRestore }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
    if (!gl) { canvas.classList.add('gl-fallback'); return }
    const vs = compile(gl, gl.VERTEX_SHADER, vert)
    const fs = compile(gl, gl.FRAGMENT_SHADER, frag)
    if (!vs || !fs) { canvas.classList.add('gl-fallback'); return }
    const prog = gl.createProgram()
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = {}
    ;['uRes', 'uScale', 'uTime', 'uEra', 'uBeat', 'uDura', 'uMouse'].forEach((n) => (u[n] = gl.getUniformLocation(prog, n)))

    // рендерим в пониженном разрешении: фон мягкий, а GPU ноутбука скажет спасибо
    // Разрешение фона. Шейдер считается чуть ниже реальной плотности экрана и растягивается:
    // телефон - 0.8 от плотности (до 2x), компьютер - 0.75, с потолком пикселей на кадр,
    // чтобы большие ретина-экраны не перегружали видеокарту.
    // Адаптивное качество снижает разрешение только при реальных провалах кадров и не ниже 0.6,
    // иначе мелкие детали (клетка, точки ксерокса, звёзды) превращаются в «мыло».
    const MAX_PIXELS = 1.6e6, MIN_QUALITY = 0.6
    let scale = 1, quality = 1
    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight
      const base = Math.min(window.devicePixelRatio || 1, 2) * (w < 760 ? 0.8 : 0.75)
      scale = Math.min(base * quality, Math.sqrt(MAX_PIXELS / (w * h)))
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const mouse = [0, 0], m = [0, 0]
    const onMove = (e) => {
      const h = window.innerHeight
      mouse[0] = (e.clientX - window.innerWidth / 2) / h
      mouse[1] = -(e.clientY - h / 2) / h
    }
    window.addEventListener('pointermove', onMove)

    const slow = reduceMotion()
    let era = store.eraTarget, dura = 0, beat = 0, time = 0, last = performance.now(), raf
    let acc = 0, frames = 0, good = 0
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) { last = now; return }
      const raw = (now - last) / 1000
      const dt = Math.min(raw, 0.05); last = now
      acc += raw; frames++
      // окно оценки по времени (около секунды), а не по числу кадров: на слабом устройстве
      // при 10-15 кадрах в секунду разрешение снижается за 1-2 секунды, а не за 3-4
      if (acc >= 1 && frames >= 4) {
        const avg = acc / frames
        if (avg > 1 / 50 && quality > MIN_QUALITY) { quality = Math.max(MIN_QUALITY, quality * 0.85); resize(); good = 0 }
        else if (avg < 1 / 57) { if (++good >= 3 && quality < 1) { quality = Math.min(1, quality * 1.1); resize(); good = 0 } }
        else good = 0
        acc = 0; frames = 0
      }
      time += dt * (slow ? 0.15 : 1)
      era += (store.eraTarget - era) * Math.min(1, dt * 5)
      if (Math.abs(store.eraTarget - era) < 0.002) era = store.eraTarget
      dura += (store.dura - dura) * Math.min(1, dt * 6)
      beat += (store.beat - beat) * Math.min(1, dt * 18)
      m[0] += (mouse[0] - m[0]) * dt * 4; m[1] += (mouse[1] - m[1]) * dt * 4
      gl.uniform2f(u.uRes, canvas.width, canvas.height)
      gl.uniform1f(u.uScale, scale)
      gl.uniform1f(u.uTime, time)
      gl.uniform1f(u.uEra, era)
      gl.uniform1f(u.uBeat, beat)
      gl.uniform1f(u.uDura, dura)
      gl.uniform2f(u.uMouse, m[0], m[1])
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(loop)
    // мобильные браузеры иногда отбирают видеоконтекст: показываем градиент и пересоздаём холст
    const onLost = (e) => { e.preventDefault(); cancelAnimationFrame(raf); canvas.classList.add('gl-fallback') }
    const onRestored = () => onRestore()
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={ref} className="era-canvas" aria-hidden="true" />
}

export default function EraCanvas() {
  const [gen, setGen] = useState(0)
  return <GLCanvas key={gen} onRestore={() => setGen((g) => g + 1)} />
}
