// Фото глав: загружаются в админке (раздел «Фото глав»). Пока src пустой, стоит заглушка.
// pos - какую часть кадра показывать (object-position), caption - подпись и alt-текст.
import { ERAS } from './eras'
export const OUTRO_ERA = { id: 'outro', year: 2026, title: { ru: 'Финал (фотобудка)', en: 'Finale (photo booth)' } }
export const ERA_PHOTOS = [...ERAS, OUTRO_ERA].map((e) => ({ id: e.id, src: null, pos: '50% 30%', caption: { ru: '', en: '' } }))
