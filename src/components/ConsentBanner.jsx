import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../i18n'
import { getConsent, setConsent } from '../lib/consent'

// Баннер cookie: появляется при первом визите и по кнопке «Настройки cookie» в подвале
export default function ConsentBanner() {
  const { t } = useLang()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(() => !getConsent())
  useEffect(() => {
    const on = () => setOpen(true)
    window.addEventListener('dora-consent-open', on)
    return () => window.removeEventListener('dora-consent-open', on)
  }, [])
  if (!open || pathname === '/admin') return null
  const choose = (v) => { setConsent(v); setOpen(false) }
  return (
    <section className="consent" role="region" aria-label={t.legal.cookieTitle}>
      <p className="consent-text">
        {t.legal.bannerText} <Link to="/cookies">{t.legal.more}</Link>
      </p>
      <div className="consent-actions">
        <button className="consent-btn" onClick={() => choose('necessary')}>{t.legal.onlyNecessary}</button>
        <button className="consent-btn consent-btn--all" onClick={() => choose('all')}>{t.legal.allowAll}</button>
      </div>
    </section>
  )
}
