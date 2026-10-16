// Клипы Доры на YouTube. Найдены на официальном канале и в поиске (октябрь 2026).
// Список редактируется в админке: «Видео» -> добавить -> вставить ссылку на YouTube.
export const VIDEOS = [
  { id: 'v-dorodura', title: 'Дорадура', year: 2019, youtube: 'bDvX111wcwg' },
  { id: 'v-vtyur', title: 'Втюрилась', year: 2020, youtube: 'FAAM7wdtXmg' },
  { id: 'v-cuterock', title: 'Кьют-рок', year: 2020, youtube: '-dtjZ6FEYO8' },
  { id: 'v-pink', title: 'Розовые волосы', year: 2022, youtube: 'heZqRIG7Dus' },
  { id: 'v-zavisima', title: 'Зависима', year: 2024, youtube: 'u88Y_eedNKU' },
  { id: 'v-yok', title: 'ЁК', year: 2025, youtube: 'mPG32p8oEnA' },
  { id: 'v-mdb', title: 'Million Dollar Baby', year: 2026, youtube: 'eTQvtx1T3Tg' },
  { id: 'v-znak', title: 'ЗНАК (Toxi$, Дора)', year: 2026, youtube: 'QpbA0jLmamY' }
]

// ID из любой ссылки YouTube: watch?v=, youtu.be/, /embed/, /shorts/ или голый ID
export function youtubeId(v) {
  if (!v) return ''
  const s = String(v).trim()
  const m = s.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : s
}
