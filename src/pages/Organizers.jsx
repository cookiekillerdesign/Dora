import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { store } from '../store'
import { tr } from '../lib/tr'
import { safeGet, safeSet, safeDel } from '../lib/storage'
import { useContent, fetchOrgKit } from '../content/ContentProvider'
import { ERAS } from '../data/eras'
import SiteFooter from '../components/SiteFooter'

// С Supabase код сверяется на сервере (функция org_kit), и только тогда приходят фото и документы.
// Без Supabase работает код по умолчанию из переменной VITE_ORGANIZER_PIN.
const KEY = 'dora-org-pin'

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    let ok = false; try { ok = document.execCommand('copy') } catch {}
    ta.remove(); return ok
  }
}

function CopyBtn({ text, t }) {
  const [done, setDone] = useState(false)
  const click = async () => { if (await copyText(text)) { setDone(true); setTimeout(() => setDone(false), 1800) } }
  return <button type="button" className={`kit-copy ${done ? 'is-done' : ''}`} onClick={click} aria-live="polite">{done ? t.org.copied : t.org.copy}</button>
}

function Contact({ label, value, href, t, external }) {
  return (
    <li className="kit-contact">
      <span className="kit-contact-label">{label}</span>
      <a className="kit-contact-value" href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{value}</a>
      {!external && <CopyBtn text={value} t={t} />}
    </li>
  )
}

function Gate({ onOpen, t }) {
  const [val, setVal] = useState('')
  const [state, setState] = useState('idle')
  const input = useRef(null)
  const form = useRef(null)
  // На телефоне не фокусируем сразу: иначе iOS мгновенно открывает клавиатуру и закрывает поля
  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) input.current?.focus({ preventScroll: true })
  }, [])
  // Когда клавиатура открылась, держим ячейки и кнопку в видимой части экрана
  const onFocus = () => {
    setTimeout(() => form.current?.querySelector('.gate-slots')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350)
  }

  const check = async (pin) => {
    setState('busy')
    const kit = await fetchOrgKit(pin)
    if (kit) { safeSet(KEY, pin, 'session'); onOpen(kit) }
    else { setState('err'); setTimeout(() => setVal(''), 500) }
  }
  const onChange = (e) => {
    if (state === 'busy') return
    const v = e.target.value.replace(/\D/g, '').slice(0, 8)
    setVal(v); if (state === 'err') setState('idle')
  }
  const submit = (e) => { e.preventDefault(); if (val.length >= 4) check(val) }
  const slots = Math.max(4, val.length)

  return (
    <form className="gate" onSubmit={submit} ref={form}>
      <div className="pass" aria-hidden="false">
        <span className="pass-hole" aria-hidden="true" />
        <div className="pass-top">
          <span className="pass-brand">дора</span>
          <span className="pass-tag">{t.org.pass}</span>
        </div>
        <h1 className="pass-title">{t.org.title}</h1>
        <p className="pass-sub">{t.org.passSub}</p>
        <label className="gate-label" htmlFor="pin">{t.org.code}</label>
        <div className={`gate-slots ${state === 'err' ? 'is-err' : ''}`} onClick={() => input.current?.focus()}>
          {Array.from({ length: slots }, (_, i) => <span key={i} className={`gate-slot ${val.length > i ? 'is-full' : ''} ${val.length === i ? 'is-cur' : ''}`} />)}
          <input id="pin" ref={input} className="gate-input" type="text" inputMode="numeric" pattern="[0-9]*"
            autoComplete="off" autoCorrect="off" spellCheck="false" data-1p-ignore data-lpignore="true" name="dora-backstage-code"
            value={val} onChange={onChange} onFocus={onFocus} maxLength={8} aria-describedby="pin-hint" aria-invalid={state === 'err'} />
        </div>
        <button className="gate-go" disabled={val.length < 4 || state === 'busy'}>
          <span>{state === 'busy' ? t.org.checking : t.org.open}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-6 6 6-6 6" /></svg>
        </button>
        <p id="pin-hint" className={`gate-hint ${state === 'err' ? 'is-err' : ''}`} role={state === 'err' ? 'alert' : undefined}>
          {state === 'err' ? t.org.wrong : t.org.hint}
        </p>
        <span className="pass-barcode" aria-hidden="true" />
      </div>
    </form>
  )
}

export default function Organizers() {
  const { t, lang } = useLang()
  const settings = useContent('settings')
  const [kit, setKit] = useState(null)
  const [restoring, setRestoring] = useState(() => !!safeGet(KEY, 'session'))
  useEffect(() => { store.eraTarget = 3 }, [])

  // после перезагрузки страницы восстанавливаем доступ по сохранённому коду
  useEffect(() => {
    const pin = safeGet(KEY, 'session')
    if (!pin) return
    fetchOrgKit(pin).then((k) => { if (k) setKit(k); else safeDel(KEY, 'session'); setRestoring(false) })
  }, [])

  if (restoring) return <div className="org" />
  if (!kit) return <div className="org"><Gate onOpen={setKit} t={t} /></div>

  const photos = kit.photos?.filter((p) => p.src) || []
  const docs = kit.docs || []
  const bio = tr(kit.bio, lang)

  return (
    <div className="org org--open">
      <header className="kit-head">
        <div>
          <span className="kit-tag">{t.org.pass} · {t.org.passSub}</span>
          <h1 className="org-title">{t.org.title}</h1>
          <p className="org-lead">{t.org.lead}</p>
        </div>
        <button className="org-lock" onClick={() => { safeDel(KEY, 'session'); setKit(null) }}>{t.org.lock}</button>
      </header>

      {bio && (
        <section className="kit-card kit-bio">
          <div className="kit-card-head">
            <h2 className="kit-h">{t.org.bio}</h2>
            <CopyBtn text={bio} t={t} />
          </div>
          <p className="kit-bio-text">{bio}</p>
        </section>
      )}

      <section className="kit-card">
        <h2 className="kit-h">{t.org.photos}</h2>
        <div className="kit-sheet">
          {photos.length
            ? photos.map((p, i) => (
                <a key={p.id || i} className="kit-frame" href={p.src} target="_blank" rel="noreferrer" download>
                  <img src={p.src} alt={tr(p.caption, lang) || t.org.photos} loading="lazy" />
                  <span className="kit-frame-n">{t.org.frame} {String(i + 1).padStart(2, '0')}</span>
                  {tr(p.caption, lang) && <span className="kit-frame-cap">{tr(p.caption, lang)}</span>}
                  <span className="kit-frame-dl">{t.org.download}</span>
                </a>
              ))
            : ERAS.map((e, i) => (
                <figure key={e.id} className="kit-frame kit-frame--ph" style={{ '--a': e.palette[0], '--b': e.palette[1] }}>
                  <span className="kit-frame-n">{t.org.frame} {String(i + 1).padStart(2, '0')}</span>
                  <figcaption className="kit-frame-cap">{t.org.photoPh}</figcaption>
                </figure>
              ))}
        </div>
      </section>

      <div className="kit-split">
        <section className="kit-card">
          <h2 className="kit-h">{t.org.docs}</h2>
          <ul className="kit-docs">
            {docs.map((d, i) => (
              <li key={d.id || i} className={`kit-doc ${d.url ? '' : 'is-soon'}`}>
                <span className="kit-doc-ico" aria-hidden="true">{(d.url?.split('.').pop() || 'pdf').slice(0, 4).toUpperCase()}</span>
                <span className="kit-doc-name">{tr(d.title, lang)}</span>
                {d.url
                  ? <a className="kit-doc-btn" href={d.url} target="_blank" rel="noreferrer" download>{t.org.download}</a>
                  : <span className="kit-doc-soon">{t.org.fileSoon}</span>}
              </li>
            ))}
          </ul>
        </section>
        <section className="kit-card">
          <h2 className="kit-h">{t.org.contacts}</h2>
          <ul className="kit-contacts">
            {settings.bookingEmail && <Contact label={t.org.booking} value={settings.bookingEmail} href={`mailto:${settings.bookingEmail}`} t={t} />}
            {settings.prEmail && <Contact label={t.org.pr} value={settings.prEmail} href={`mailto:${settings.prEmail}`} t={t} />}
            {settings.tourUrl && <Contact label={t.org.tour} value={settings.tourUrl.replace(/^https?:\/\//, '')} href={settings.tourUrl} t={t} external />}
          </ul>
        </section>
      </div>
      <SiteFooter />
    </div>
  )
}
