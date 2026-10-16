import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useLang } from '../i18n'
import { getLenis } from '../lib/smooth'
import Socials from './Socials'
import { openConsent } from '../lib/consent'
import logoMark from '../assets/logo-mark.webp'

const FONTS = ['f-hand', 'f-spray', 'f-bubble', 'f-miss', 'f-love', 'f-now', 'f-ui']

export default function Nav() {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const panel = useRef(null), btn = useRef(null)
  const { pathname } = useLocation()
  const taps = useRef([])
  // пять быстрых тапов по логотипу включают дорадура-режим (для телефонов без клавиатуры)
  const onMark = (e) => {
    if (pathname === '/') {
      // уже на главной: не перезагружаем, а плавно возвращаемся к первому слайду плёнки
      e.preventDefault()
      const l = getLenis()
      if (l) l.scrollTo(0, { duration: 1.4 })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    const now = Date.now()
    // считаем тапы подряд: пауза между ними не больше 0,8 секунды
    const last = taps.current[taps.current.length - 1]
    taps.current = last && now - last < 800 ? [...taps.current, now] : [now]
    if (taps.current.length >= 5) { taps.current = []; window.dispatchEvent(new Event('dora-egg')) }
  }

  const items = [
    ['/', t.nav.home], ['/music', t.nav.music], ['/video', t.nav.video], ['/tour', t.nav.tour], ['/news', t.nav.news],
    ['/merch', t.nav.merch], ['/organizers', t.nav.org]
  ]

  useEffect(() => { setOpen(false) }, [pathname])
  // на внутренних страницах при прокрутке у шапки появляется подложка, чтобы она не наезжала на контент
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(pathname !== '/' && window.scrollY > 30)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [pathname])

  useEffect(() => {
    const l = getLenis()
    if (open) {
      l?.stop()
      // iOS игнорирует overflow:hidden у body: фиксируем страницу на месте и потом возвращаем позицию
      const y = window.scrollY
      Object.assign(document.body.style, { position: 'fixed', top: `-${y}px`, left: '0', right: '0', width: '100%', overflow: 'hidden' })
      document.body.dataset.lockY = String(y)
      document.body.dataset.lockPath = pathname
      panel.current.querySelector('.menu-link')?.focus({ preventScroll: true })
      const onKey = (e) => {
        if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); return }
        if (e.key !== 'Tab') return
        // фокус не уходит за меню: только пункты меню и кнопка «Закрыть»
        const nodes = [btn.current, ...panel.current.querySelectorAll('a, button')].filter(Boolean)
        const i = nodes.indexOf(document.activeElement)
        const next = e.shiftKey ? (i <= 0 ? nodes.length - 1 : i - 1) : (i === nodes.length - 1 ? 0 : i + 1)
        e.preventDefault(); nodes[next].focus()
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    l?.start()
    if (document.body.dataset.lockY != null) {
      // позицию возвращаем, только если меню закрыли на той же странице;
      // при переходе по ссылке из меню новая страница открывается сверху
      const y = document.body.dataset.lockPath === pathname ? +document.body.dataset.lockY : 0
      delete document.body.dataset.lockPath
      Object.assign(document.body.style, { position: '', top: '', left: '', right: '', width: '', overflow: '' })
      delete document.body.dataset.lockY
      window.scrollTo(0, y)
    }
  }, [open])

  return (
    <>
      <Link to="/" className={`nav-mark ${open ? 'nav-mark--menu' : ''}`} aria-label="дора, на главную" onClick={onMark}>
        <img src={logoMark} alt="" width="283" height="120" decoding="async" draggable="false" />
      </Link>
      <header className={`nav ${open ? 'nav--open' : ''} ${solid && !open ? 'nav--solid' : ''}`}>
        <span className="nav-mark-space" aria-hidden="true" />
        <nav className="nav-links" aria-label={t.nav.label}>
          {items.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        </nav>
        <div className="nav-right">
          <button className="nav-lang" onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} aria-label={t.nav.langLabel}>{t.nav.lang}</button>
          <button ref={btn} className="nav-burger" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={open ? 'menu' : undefined}>
            <span className="burger-lines" aria-hidden="true"><i /><i /></span>
            <span className="burger-text">{open ? t.nav.close : t.nav.menu}</span>
          </button>
        </div>
      </header>
      {open && (
        <div id="menu" className="menu" ref={panel} data-lenis-prevent role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <ul className="menu-list">
            {items.map(([to, label], i) => (
              <li key={to} style={{ '--i': i }}>
                <NavLink to={to} end={to === '/'} className={`menu-link ${FONTS[i % FONTS.length]}`}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="menu-foot">
            <Socials />
            <nav className="menu-legal" aria-label={t.legal.docs}>
              <Link to="/legal">{t.legal.info}</Link>
              <Link to="/privacy">{t.legal.privacy}</Link>
              <Link to="/cookies">{t.legal.cookies}</Link>
              <Link to="/terms">{t.legal.terms}</Link>
              <button type="button" onClick={openConsent}>{t.legal.settings}</button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
