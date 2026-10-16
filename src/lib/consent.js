import { useEffect, useState } from 'react'
import { safeGet, safeSet } from './storage'

// Согласие на сторонние cookie. 'necessary' - только необходимое, 'all' - можно загружать плеер Spotify.
const KEY = 'dora-consent'
const EVT = 'dora-consent-change'

export function getConsent() {
  try { return JSON.parse(safeGet(KEY) || 'null')?.value || null } catch { return null }
}
export function setConsent(value) {
  safeSet(KEY, JSON.stringify({ value, at: new Date().toISOString() }))
  window.dispatchEvent(new Event(EVT))
}
export function openConsent() { window.dispatchEvent(new Event('dora-consent-open')) }

export function useConsent() {
  const [v, setV] = useState(getConsent)
  useEffect(() => {
    const on = () => setV(getConsent())
    window.addEventListener(EVT, on)
    return () => window.removeEventListener(EVT, on)
  }, [])
  return v
}
