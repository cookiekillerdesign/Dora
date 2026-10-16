import { TOUR_URL } from './links'
// Даты собраны с открытых афиш (Яндекс Афиша, агрегаторы билетов), октябрь 2026.
// Перед публикацией сверить с официальной страницей билетов: band.link/dora_2026
export const TICKETS_URL = TOUR_URL
export const SHOWS = [
  { date: '2026-01-04', city: { ru: 'Москва', en: 'Moscow' }, venue: 'ДК Кристалл' },
  { date: '2026-03-15', city: { ru: 'Москва', en: 'Moscow' }, venue: 'TAU' },
  { date: '2026-08-01', city: { ru: 'Краснодар', en: 'Krasnodar' }, venue: 'Порт 219' },
  { date: '2026-08-08', city: { ru: 'Москва', en: 'Moscow' }, venue: 'VK Музыка Летом' },
  { date: '2026-08-14', city: { ru: 'Казань', en: 'Kazan' }, venue: 'Roof Place' },
  { date: '2026-08-16', city: { ru: 'Екатеринбург', en: 'Yekaterinburg' }, venue: 'Tele-Club' },
  { date: '2026-08-29', city: { ru: 'Санкт-Петербург', en: 'Saint Petersburg' }, venue: 'Roof Place' },
  { date: '2026-09-13', city: { ru: 'Новосибирск', en: 'Novosibirsk' }, venue: 'Подземка' },
  { date: '2026-09-19', city: { ru: 'Астана', en: 'Astana' }, venue: 'Oligard' },
  { date: '2026-09-20', city: { ru: 'Алматы', en: 'Almaty' }, venue: 'Motor Club' },
  { date: '2026-11-01', city: { ru: 'Москва', en: 'Moscow' }, venue: 'МТС Live Холл', note: 'Halloween Fest' },
  { date: '2026-11-04', city: { ru: 'Владивосток', en: 'Vladivostok' }, venue: 'Mix' },
  { date: '2026-11-13', city: { ru: 'Королёв', en: 'Korolyov' }, venue: 'Duplex' },
  { date: '2026-11-15', city: { ru: 'Саратов', en: 'Saratov' }, venue: 'Onyx', home: true },
  { date: '2026-11-26', city: { ru: 'Тюмень', en: 'Tyumen' }, venue: 'Глав клуб' },
  { date: '2026-11-27', city: { ru: 'Челябинск', en: 'Chelyabinsk' }, venue: 'Максимилианс' },
  { date: '2026-12-01', city: { ru: 'Уфа', en: 'Ufa' }, venue: 'Огни Уфы' },
  { date: '2026-12-04', city: { ru: 'Нижний Новгород', en: 'Nizhny Novgorod' }, venue: 'Milo Concert Hall' },
  { date: '2026-12-05', city: { ru: 'Тула', en: 'Tula' }, venue: 'Mini by Concert Hall' },
  { date: '2026-12-06', city: { ru: 'Рязань', en: 'Ryazan' }, venue: null },
  { date: '2026-12-17', city: { ru: 'Киров', en: 'Kirov' }, venue: 'Gaudi' },
  { date: '2026-12-19', city: { ru: 'Ижевск', en: 'Izhevsk' }, venue: 'Nobel Concert Hall' },
  { date: '2026-12-20', city: { ru: 'Пермь', en: 'Perm' }, venue: 'Свобода' }
]
export const isPast = (iso) => new Date(iso + 'T23:59:59') < new Date()
