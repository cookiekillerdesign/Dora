// Главы сайта и полная дискография.
// Тексты пересказаны своими словами по открытым источникам.
// Треклисты сверены по Spotify, Deezer, Яндекс Музыке и Last.fm (октябрь 2026).
//
// Поля трека: t - название; spotify / yandex - ID трека; album - ID релиза-сингла в Spotify;
// single: true - сингл вне альбома (раздел «Синглы» главы); bpm - темп для пластинки.
// Без ID трек играет внутри плеера альбома или открывается поиском сервиса.

export const YANDEX_ARTIST = 'https://music.yandex.ru/artist/6826935'

export const ERAS = [
  {
    id: 'prologue',
    font: 'f-hand',
    year: 2018,
    years: '2018 - 2019',
    palette: ['#1F3FAF', '#A9C4E6', '#E23B3B'],
    albumId: '4mOMGd9Uxe7hNd4oGkGvD8',
    albumCount: 6,
    cta: { ru: 'С чего всё началось', en: 'Where it all began' },
    kind: { ru: 'до всего', en: 'before it all' },
    title: { ru: 'Mental Affection', en: 'Mental Affection' },
    text: { ru: 'Саратов, гитара, синтезатор и песни во ВКонтакте - всему этому она научилась сама. Первый псевдоним, Mental Affection, оказался слишком сложным, и его сменило домашнее имя, которым её звала мама. В январе 2019 выходит EP «Я не коммерция».', en: 'Saratov, a guitar, a synth and songs posted on VK, all self-taught. The first alias, Mental Affection, was too hard to remember, so it gave way to the nickname her mom used at home. In January 2019 the EP “Я не коммерция” comes out.' },
    tracks: [
      { t: 'почему?' },
      { t: 'little angel' },
      { t: 'звезда' },
      { t: 'девочка с каре' },
      { t: '725' },
      { t: 'хочу быть с тобой' },
      // синглы
      { t: 'Мне пусто', single: true },
      { t: 'Я не ругаюсь матом, ч. 1', single: true },
      { t: 'Я всегда буду рядом', single: true },
      { t: 'Без радости в глазах', single: true }
    ]
  },
  {
    id: 'sister',
    font: 'f-spray',
    year: 2019,
    years: 'ноябрь 2019',
    yearsEn: 'November 2019',
    palette: ['#FF3D8B', '#FFE45C', '#FFFFFF'],
    albumId: '5mzBD1HZYryijhnmMgHUPq',
    albumCount: 7,
    yandexAlbum: '8886142',
    cta: { ru: 'Включить погромче', en: 'Turn it up' },
    kind: { ru: 'дебютный альбом', en: 'debut album' },
    title: { ru: 'Младшая сестра', en: 'Младшая сестра' },
    sub: { ru: 'Little sister', en: 'Little sister' },
    text: { ru: '«Дорадура» разлетается по YouTube и TikTok, а весной 2020 Дора исполняет её в «Вечернем Урганте». Девчонка с гитарой, которая не стесняется быть смешной.', en: '“Дорадура” spreads across YouTube and TikTok, and in spring 2020 Dora performs it on Evening Urgant. A girl with a guitar who isn’t afraid to be funny.' },
    tracks: [
      { t: 'Дорадура', spotify: '4mTPviBGRgjPxeaQFnBDW3', bpm: 140 },
      { t: 'Младшая сестра', spotify: '74rl89i6GlqWwOFVlBtEh9', yandex: '58507005', bpm: 118 },
      { t: 'Интернет-свидание' },
      { t: 'Жулик (feat. МУККА)' },
      { t: 'Подружки' },
      { t: 'Задолбал меня игнорить' },
      { t: 'Дождик за окном' },
      // синглы
      { t: 'На скейте', single: true, spotify: '65q197WkYybilfXVYMLCOm', bpm: 128 }
    ]
  },
  {
    id: 'cuterock',
    font: 'f-bubble',
    year: 2020,
    years: 'декабрь 2020',
    yearsEn: 'December 2020',
    palette: ['#E0103A', '#9FD8FF', '#FFB3D9'],
    albumId: '7hDvB29vtfPYypzxaxnMpT',
    albumCount: 9,
    cta: { ru: 'Втюриться заново', en: 'Fall in love again' },
    kind: { ru: 'альбом', en: 'album' },
    title: { ru: 'Боже, храни кьют-рок', en: 'Боже, храни кьют-рок' },
    sub: { ru: 'God save cute-rock', en: 'God save cute-rock' },
    text: { ru: 'Жанр она назвала сама: гитары громче, сердечки ярче. «Втюрилась» взлетает в чартах, а итальянская версия Innamorata звучит в новогоднем выпуске «Вечернего Урганта».', en: 'She named the genre herself: louder guitars, brighter hearts. “Втюрилась” climbs the charts, and its Italian version, Innamorata, airs on Evening Urgant’s New Year special.' },
    tracks: [
      { t: 'Втюрилась', spotify: '1AuUsvFyFnf2l3E6HKUHO2', bpm: 150 },
      { t: 'Быть с тобой' },
      { t: 'Больше' },
      { t: 'Осень пьяная' },
      { t: 'На обратной стороне земли' },
      { t: 'Кьют-рок', spotify: '1RhItk6EjZzE0zs8S1y9VG', bpm: 140 },
      { t: 'Где ты сейчас' },
      { t: 'Если хочешь', spotify: '72C9CgR2JWCuxXTeWmeWv4' },
      { t: 'Капли', spotify: '1IBqMJMl0DgLGkSP9mYfRn' },
      // синглы
      { t: 'Не исправлюсь (feat. МЭЙБИ БЭЙБИ)', single: true },
      { t: 'Втюрилась (Новогодняя версия)', single: true },
      { t: 'Innamorata', single: true },
      { t: 'Разлетаюсь', single: true }
    ]
  },
  {
    id: 'miss',
    font: 'f-miss',
    year: 2022,
    years: 'июнь 2022',
    yearsEn: 'June 2022',
    palette: ['#C9CDD6', '#FFFFFF', '#B04A9E'],
    albumId: '2umHPKn2Mggn9RUqT8beQy',
    albumCount: 13,
    cta: { ru: 'Примерить корону', en: 'Try on the crown' },
    kind: { ru: 'альбом', en: 'album' },
    title: { ru: 'MISS', en: 'MISS' },
    text: { ru: 'Биты, трещотки и R&B. Альбом поднимается на первое место российского iTunes, а песни теперь не только о разбитом сердце, но и о славе, одиночестве и самоиронии.', en: 'Beats, rattles and R&B. The album hits number one on Russian iTunes, and the songs now cover fame, loneliness and self-irony, not just heartbreak.' },
    tracks: [
      { t: 'Розовые волосы' },
      { t: 'Автопилот (feat. Платина)' },
      { t: 'Заставь' },
      { t: 'La bohème' },
      { t: 'Loverboy' },
      { t: 'Я боюсь людей' },
      { t: 'Нет тебя (feat. ЛСП)' },
      { t: 'Бриллианты' },
      { t: 'Мама' },
      { t: 'Стоп-слово' },
      { t: 'Барбисайз (feat. МЭЙБИ БЭЙБИ)' },
      { t: 'Маленькая леди' },
      { t: 'Засыпать' },
      // синглы
      { t: 'Сан Ларан', single: true },
      { t: 'Пошлю его на...', single: true },
      { t: 'Папик', single: true },
      { t: 'Не игра', single: true },
      { t: 'Cayendo', single: true },
      { t: 'Дора дура', single: true }
    ]
  },
  {
    id: 'lovesongs',
    font: 'f-love',
    year: 2024,
    years: 'октябрь 2024',
    yearsEn: 'October 2024',
    palette: ['#FFB46B', '#E9B7B0', '#FFE9E0'],
    albumId: '6C1FjJm5Hs4c3Gd5RtKk9e',
    albumCount: 18,
    cta: { ru: 'Перезвонить маме', en: 'Call mom back' },
    kind: { ru: 'альбом', en: 'album' },
    title: { ru: 'LOVESONGS', en: 'LOVESONGS' },
    text: { ru: 'Пластинка начинается со звонка маме. Дальше - поп-R&B про любовь во всех её версиях, с Мэйби Бэйби, луни ану, АКУЛИЧ и lowlife на фитах.', en: 'The record opens with a phone call to her mom. Then comes pop-R&B about love in all its versions, featuring Мэйби Бэйби, луни ану, АКУЛИЧ and lowlife.' },
    tracks: [
      { t: 'Кошки на сердце' },
      { t: 'Зависима' },
      { t: 'Дежавю' },
      { t: 'Hot Girls Club' },
      { t: 'Танго в Париже' },
      { t: 'Лучше тебя' },
      { t: 'Реки на щеках' },
      { t: 'Прощай' },
      { t: 'NIGHTLIFE' },
      { t: 'Самолёты-поезда' },
      { t: 'Luv u' },
      { t: 'Высоко' },
      { t: 'Caprice' },
      { t: 'Пустые слова' },
      { t: 'ASTI', spotify: '7BnKkGBukmICES3gFhZaIw', bpm: 100 },
      { t: 'Моя одежда ещё пахнет тобой' },
      { t: 'Останься' },
      { t: 'Простить себя' },
      // синглы
      { t: 'Куда уходит детство', single: true }
    ]
  },
  {
    id: 'now',
    font: 'f-now',
    year: 2026,
    years: '2025 - 2026',
    palette: ['#DDEBFF', '#FF2E63', '#FFFFFF'],
    cta: { ru: 'Что играет сейчас', en: 'What’s playing now' },
    kind: { ru: 'синглы', en: 'singles' },
    title: { ru: 'Сейчас', en: 'Now' },
    text: { ru: 'Новая эра пишется прямо сейчас, по одному синглу.', en: 'The new era is being written right now, one single at a time.' },
    singles: ['ЁК', 'Понарошку', 'Кабы не было зимы', 'Дурочка', 'лонли лав', 'Million Dollar Baby'],
    tracks: [
      { t: 'ЁК', single: true },
      { t: 'Понарошку', single: true, album: '3dI4yc1x2bjkjrOCR0aMF2', bpm: 110 },
      { t: 'Кабы не было зимы', single: true },
      { t: 'Дурочка', single: true },
      { t: 'лонли лав', single: true },
      { t: 'Million Dollar Baby', single: true, spotify: '4LsYvtBZEWVS57sslPo9sE', bpm: 112 },
      { t: 'ЗНАК (с Toxi$)', single: true }
    ]
  }
]

export const spotifySearch = (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`
export const spotifyTrack = (id) => `https://open.spotify.com/track/${id}`
