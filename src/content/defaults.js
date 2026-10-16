import { VIDEOS } from '../data/videos'
// Значения по умолчанию для всех редактируемых блоков.
// Если Supabase подключён и в админке что-то сохранено, сайт берёт оттуда.
import { ERAS } from '../data/eras'
import { ERA_PHOTOS } from '../data/photos'
import { SHOWS } from '../data/tour'
import { NEWS } from '../data/news'
import { MERCH } from '../data/merch'
import { SOCIALS, TOUR_URL, OFFICIAL_SITE, STORE_URL, BOOKING_EMAIL, PR_EMAIL } from '../data/links'

export const DEFAULT_PIN = import.meta.env.VITE_ORGANIZER_PIN || '1111'

export const DEFAULTS = {
  eras: ERAS,
  clips: ERA_PHOTOS,
  videos: VIDEOS,
  tour: SHOWS.map((s, i) => ({ id: `show-${i}`, ...s })),
  news: NEWS,
  merch: MERCH.map((m) => ({ ...m, photo: null })),
  socials: SOCIALS,
  settings: { tourUrl: TOUR_URL, officialSite: OFFICIAL_SITE, storeUrl: STORE_URL, bookingEmail: BOOKING_EMAIL, prEmail: PR_EMAIL,
    ownerName: '', ownerLocation: '', ownerEmail: '', legalUpdated: '2026-10-13' }
}

// Закрытый блок: читается только через функцию org_kit(pin) в Supabase
export const DEFAULT_ORG = {
  pin: DEFAULT_PIN,
  bio: {
    ru: 'Дора (Дарья Шиханова) - певица и автор песен из Саратова. Придумала жанр «кьют-рок», прославилась вирусной «Дорадурой», а затем ушла в поп-R&B на альбомах MISS и LOVESONGS. MISS поднимался на первое место российского iTunes. В 2026 году - большой тур по городам России и Казахстана.',
    en: 'Dora (Daria Shikhanova) is a singer-songwriter from Saratov. She coined the genre “cute-rock”, broke through with the viral hit “Дорадура”, then moved into pop-R&B with the albums MISS and LOVESONGS. MISS reached number one on Russian iTunes. In 2026 she tours cities across Russia and Kazakhstan.'
  },
  photos: [],
  docs: [
    { id: 'tech', title: { ru: 'Технический райдер', en: 'Technical rider' }, url: null },
    { id: 'hosp', title: { ru: 'Бытовой райдер', en: 'Hospitality rider' }, url: null },
    { id: 'stage', title: { ru: 'Сценический план', en: 'Stage plot' }, url: null },
    { id: 'press', title: { ru: 'Логотипы и пресс-релиз', en: 'Logos and press release' }, url: null }
  ]
}

// Списки с фиксированным составом: правки накладываются на элементы по id,
// а оформление (шрифты, палитры) остаётся из кода.
export const MERGE_BY_ID = ['eras', 'clips']
