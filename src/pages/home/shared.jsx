import { Link } from 'react-router-dom'
import { useLang } from '../../i18n'
import { tr } from '../../lib/tr'
import EraPhoto from '../../components/EraPhoto'
import { useContent } from '../../content/ContentProvider'

export function Listen({ era }) {
  const { lang } = useLang()
  return <Link className="listen" to={`/music?era=${era.id}`}>{tr(era.cta, lang)}</Link>
}

// Фото главы в подаче своей эпохи. which="second" - второе фото главы (Младшая сестра, финал).
export function EraSlot({ era, lang, which = 'main' }) {
  const photo = useContent('clips').find((x) => x.id === era.id) || {}
  const { t } = useLang()
  const second = which === 'second'
  const shown = second ? { src: photo.src2, pos: photo.pos2 || '50% 40%', caption: photo.caption2 } : photo
  const variant = second ? (era.id === 'sister' ? 'strip' : 'snap') : era.id
  return (
    <div className={`era-clip era-clip--${era.id}${second ? '-2' : ''}`}>
      <EraPhoto era={era} variant={variant} photo={shown} lang={lang} placeholder={`${t.photo.ph} ${era.year}`} />
    </div>
  )
}

export const yearsOf = (era, lang) => (lang === 'en' && era.yearsEn) || era.years
