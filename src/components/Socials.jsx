import { useContent } from '../content/ContentProvider'
import { useLang } from '../i18n'

export default function Socials({ big = false }) {
  const { t, lang } = useLang()
  const socials = useContent('socials')
  const settings = useContent('settings')
  return (
    <ul className={`socials ${big ? 'socials--big' : ''}`} aria-label={t.socials.title}>
      {socials.filter((s) => s.url).map((s, i) => (
        <li key={s.id || i}>
          <a className={`soc soc--${s.id || 'x'}`} href={s.url} target="_blank" rel="noreferrer">
            <span className="soc-label">{(lang === 'en' && s.labelEn) || s.label}</span>
            {s.handle && <span className="soc-handle">@{s.handle}</span>}
          </a>
        </li>
      ))}
      <li>
        <a className="soc soc--tour" href={settings.tourUrl} target="_blank" rel="noreferrer">
          <span className="soc-label">{t.socials.tour}</span>
          <span className="soc-handle">band.link</span>
        </a>
      </li>
    </ul>
  )
}

// Пометка о Meta рядом со ссылкой на Instagram
export function MetaNote({ socials }) {
  const { t } = useLang()
  if (!socials?.some((s) => s.url && /instagram\.com/i.test(s.url))) return null
  return <p className="meta-note">{t.legal.metaNote}</p>
}
