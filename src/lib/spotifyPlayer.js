import { useEffect, useRef, useState } from 'react'

// Spotify Embed iFrame API: сообщает, играет плеер или стоит на паузе.
// Если API не загрузился (блокировщик, превью), остаётся обычный iframe и пластинка
// закручивается, когда человек начал взаимодействовать с плеером.
let apiPromise = null
export function loadSpotifyApi(timeout = 7000) {
  if (window.__spotifyIFrameAPI) return Promise.resolve(window.__spotifyIFrameAPI)
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeout)
    window.onSpotifyIframeApiReady = (api) => { clearTimeout(timer); window.__spotifyIFrameAPI = api; resolve(api) }
    const s = document.createElement('script')
    s.src = 'https://open.spotify.com/embed/iframe-api/v1'
    s.async = true
    s.onerror = () => { clearTimeout(timer); reject(new Error('blocked')) }
    document.body.appendChild(s)
  })
  apiPromise.catch(() => { apiPromise = null })
  return apiPromise
}

export function useSpotifyPlayer(hostRef, uri, enabled, height = 380) {
  const [mode, setMode] = useState(null) // 'api' | 'iframe'
  const [playing, setPlaying] = useState(false)
  const ctrl = useRef(null)
  const firstUri = useRef(uri)

  useEffect(() => {
    if (!enabled || !hostRef.current) return
    let alive = true
    const el = document.createElement('div')
    hostRef.current.appendChild(el)
    loadSpotifyApi().then((api) => {
      if (!alive) return
      api.createController(el, { uri: firstUri.current, width: '100%', height }, (c) => {
        if (!alive) { try { c.destroy() } catch {} return }
        ctrl.current = c
        setMode('api')
        c.addListener('playback_update', (e) => {
          const d = e?.data || {}
          setPlaying(!d.isPaused && !(d.duration && d.position >= d.duration))
        })
      })
    }).catch(() => { if (alive) setMode('iframe') })
    return () => {
      alive = false
      try { ctrl.current?.destroy() } catch {}
      ctrl.current = null
      if (hostRef.current) hostRef.current.innerHTML = ''
      setMode(null); setPlaying(false)
    }
  }, [enabled])

  useEffect(() => {
    setPlaying(false)
    if (ctrl.current && uri) { try { ctrl.current.loadUri(uri) } catch {} }
    firstUri.current = uri
  }, [uri])

  // запасной режим: считаем, что музыка пошла, когда человек кликнул внутрь плеера
  useEffect(() => {
    if (mode !== 'iframe') return
    const onBlur = () => setTimeout(() => {
      const a = document.activeElement
      if (a && a.tagName === 'IFRAME' && a.closest('.player')) setPlaying(true)
    }, 0)
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [mode])

  return { mode, playing }
}
