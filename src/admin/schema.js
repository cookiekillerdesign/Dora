// Описание всех редактируемых блоков. Админка строит формы по этой схеме.
// Типы полей: text, textarea, number, date, checkbox, select, i18n (RU+EN), spotify, image, file, strings, list.
import { DEFAULTS, DEFAULT_ORG } from '../content/defaults'

const i18n = (name, label, extra = {}) => ({ name, label, type: 'i18n', ...extra })
const ERA_NAMES = { ...Object.fromEntries(DEFAULTS.eras.map((e) => [e.id, e.title.ru])), outro: 'Финал (фотобудка)' }

export const ART_OPTIONS = [
  ['pick', 'Медиаторы'], ['tee', 'Футболка'], ['pendant', 'Кулон'], ['stickers', 'Стикеры'], ['hoodie', 'Худи'],
  ['tag', 'Жетон'], ['poster', 'Плакат'], ['socks', 'Носки'], ['bracelet', 'Браслет']
]

export const BLOCKS = [
  {
    key: 'eras', title: 'Главы на плёнке', hint: 'Шесть глав главной страницы. Состав и порядок фиксированы, оформление задано в коде.',
    kind: 'list', fixed: true, itemTitle: (it) => it.title?.ru || ERA_NAMES[it.id],
    fields: [
      i18n('title', 'Заголовок', { required: true }),
      { name: 'years', label: 'Когда (RU)', type: 'text', placeholder: 'ноябрь 2019' },
      { name: 'yearsEn', label: 'Когда (EN)', type: 'text', placeholder: 'November 2019' },
      { name: 'year', label: 'Год на счётчике кассеты', type: 'number' },
      i18n('kind', 'Тип релиза', { placeholder: 'альбом' }),
      i18n('text', 'Текст', { multiline: true }),
      i18n('cta', 'Текст кнопки'),
      { name: 'singles', label: 'Плашки синглов', type: 'strings', showIf: (it) => it.id === 'now' },
      { name: 'albumId', label: 'Альбом в Spotify: ссылка или ID (плеер покажет весь треклист)', type: 'spotify' },
      { name: 'albumCount', label: 'Сколько треков в альбоме', type: 'number' },
      { name: 'yandexAlbum', label: 'Альбом в Яндекс Музыке: ссылка или ID', type: 'yandex' },
      { name: 'cover', label: 'Обложка альбома (встаёт в центр пластинки на странице музыки)', type: 'image' },
      {
        name: 'tracks', label: 'Треки на странице музыки', type: 'list', itemTitle: (t) => t.t,
        fields: [
          { name: 't', label: 'Название', type: 'text', required: true },
          { name: 'spotify', label: 'Ссылка или ID трека в Spotify', type: 'spotify' },
          { name: 'yandex', label: 'Ссылка или ID трека в Яндекс Музыке', type: 'yandex' },
          { name: 'single', label: 'Сингл (вне альбома)', type: 'checkbox' },
          { name: 'cover', label: 'Обложка трека (блок «Сейчас» и центр пластинки)', type: 'image' },
          { name: 'q', label: 'Поиск в Spotify, если ссылки нет', type: 'text', placeholder: 'дора название' },
          { name: 'bpm', label: 'Темп, BPM (для пластинки)', type: 'number', placeholder: '110' }
        ]
      }
    ]
  },
  {
    key: 'videos', title: 'Видео', hint: 'Клипы на странице «Видео». Вставьте ссылку на YouTube - ID извлечётся сам. Новые сверху по году.',
    kind: 'list', itemTitle: (it) => `${it.title || 'Клип'}${it.year ? ' · ' + it.year : ''}`,
    newItem: () => ({ id: 'v-' + Math.random().toString(36).slice(2, 8), title: '', year: new Date().getFullYear(), youtube: '' }),
    fields: [
      { name: 'title', label: 'Название', type: 'text', required: true },
      { name: 'year', label: 'Год', type: 'number' },
      { name: 'youtube', label: 'Ссылка на YouTube или ID', type: 'youtube', required: true }
    ]
  },
  {
    key: 'clips', title: 'Фото глав', hint: 'Фото Доры для каждой главы. Рамка (полароид, ксерокс, плёнка…) задана дизайном главы. Фото «Сейчас» показывается в газете «Анонсы», если у первого анонса нет своего фото. Большие снимки сжимаются автоматически при загрузке.',
    kind: 'list', fixed: true, preview: 'photo', itemTitle: (it) => ERA_NAMES[it.id] || it.id,
    fields: [
      { name: 'src', label: 'Фото', type: 'image' },
      { name: 'pos', label: 'Какую часть кадра показывать', type: 'select', options: [['50% 30%', 'Лицо (верх)'], ['50% 50%', 'Центр'], ['50% 80%', 'Низ']] },
      i18n('caption', 'Подпись (видна на полароиде, остальным служит описанием для незрячих)'),
      { name: 'src2', label: 'Второе фото: большое фото внизу главы', type: 'image', showIf: (it) => it.id === 'sister' },
      { name: 'src2', label: 'Второе фото: снимок рядом с фотобудкой', type: 'image', showIf: (it) => it.id === 'outro' },
      { name: 'strip2', label: 'Фотобудка: второй кадр (пусто - повторяет первый)', type: 'image', showIf: (it) => it.id === 'outro' },
      { name: 'strip3', label: 'Фотобудка: третий кадр (пусто - повторяет первый)', type: 'image', showIf: (it) => it.id === 'outro' },
      { name: 'pos2', label: 'Второе фото: какую часть кадра показывать', type: 'select', options: [['50% 30%', 'Лицо (верх)'], ['50% 50%', 'Центр'], ['50% 80%', 'Низ']], showIf: (it) => it.id === 'sister' || it.id === 'outro' }
    ]
  },
  {
    key: 'tour', title: 'Тур', hint: 'Концерты сортируются по дате автоматически, прошедшие уходят вниз сами.',
    kind: 'list', itemTitle: (it) => [it.date, it.city?.ru].filter(Boolean).join(', ') || 'Новый концерт',
    newItem: () => ({ date: '', city: { ru: '', en: '' }, venue: '', note: '', home: false, url: '' }),
    fields: [
      { name: 'date', label: 'Дата', type: 'date', required: true },
      i18n('city', 'Город', { required: true }),
      { name: 'venue', label: 'Площадка', type: 'text', placeholder: 'пусто = «площадка уточняется»' },
      { name: 'note', label: 'Пометка', type: 'text', placeholder: 'например, название фестиваля' },
      { name: 'url', label: 'Своя ссылка на билеты', type: 'text', placeholder: 'пусто = общая ссылка на тур' },
      { name: 'home', label: 'Концерт дома (наклейка «дома!»)', type: 'checkbox' }
    ]
  },
  {
    key: 'news', title: 'Анонсы', hint: 'Первая новость в списке становится главной на газетной полосе.',
    kind: 'list', itemTitle: (it) => it.head?.ru || 'Новый анонс',
    newItem: () => ({ kind: 'release', date: '', head: { ru: '', en: '' }, text: { ru: '', en: '' }, link: '', internal: false }),
    fields: [
      { name: 'kind', label: 'Рубрика', type: 'select', options: [['release', 'Релиз'], ['tour', 'Тур'], ['live', 'Концерт']] },
      { name: 'date', label: 'Дата (можно оставить пустой)', type: 'date' },
      i18n('head', 'Заголовок', { required: true }),
      i18n('text', 'Текст', { multiline: true }),
      { name: 'link', label: 'Ссылка', type: 'text', placeholder: 'https://… или /tour' },
      { name: 'internal', label: 'Ссылка ведёт на страницу этого сайта', type: 'checkbox' },
      { name: 'photo', label: 'Фото к анонсу (у первого анонса - большое фото на первой полосе газеты)', type: 'image' }
    ]
  },
  {
    key: 'merch', title: 'Мерч', hint: 'Если загрузить фото, оно заменит нарисованную наклейку.',
    kind: 'list', preview: 'merch', itemTitle: (it) => it.name?.ru || 'Новый товар',
    newItem: () => ({ art: 'stickers', name: { ru: '', en: '' }, desc: { ru: '', en: '' }, url: '', photo: null }),
    fields: [
      i18n('name', 'Название', { required: true }),
      i18n('desc', 'Короткое описание'),
      { name: 'url', label: 'Ссылка на товар в магазине', type: 'text', placeholder: 'пусто = главная магазина' },
      { name: 'art', label: 'Рисунок-наклейка', type: 'select', options: ART_OPTIONS },
      { name: 'photo', label: 'Главное фото товара', type: 'image' },
      { name: 'price', label: 'Цена (необязательно)', type: 'text', placeholder: 'пусто = «Актуальная цена в магазине»' },
      { name: 'sizes', label: 'Размеры', type: 'strings' },
      i18n('details', 'Подробнее о вещи (состав, уход, размеры)', { multiline: true }),
      { name: 'gallery', label: 'Ещё фото', type: 'list', itemTitle: (g, i) => 'Фото', newItem: () => ({ src: null }), fields: [{ name: 'src', label: 'Фото', type: 'image' }] }
    ]
  },
  {
    key: 'socials', title: 'Соцсети', hint: 'Таблички в меню, на главной и внизу каждой страницы. Цвет задаётся по id: tg, vk, ig, tt, sp.',
    kind: 'list', itemTitle: (it) => it.label || 'Новая ссылка',
    newItem: () => ({ id: '', label: '', labelEn: '', handle: '', url: '' }),
    fields: [
      { name: 'label', label: 'Название', type: 'text', required: true },
      { name: 'labelEn', label: 'Название (EN), если отличается', type: 'text' },
      { name: 'handle', label: 'Ник без @', type: 'text' },
      { name: 'url', label: 'Ссылка', type: 'text', required: true },
      { name: 'id', label: 'Цвет (tg, vk, ig, tt, sp)', type: 'text' }
    ]
  },
  {
    key: 'settings', title: 'Ссылки, контакты и владелец', kind: 'single',
    hint: 'Данные владельца нужны для правовой информации и политики персональных данных. Пока они пустые, на страницах документов видна пометка.',
    fields: [
      { name: 'tourUrl', label: 'Билеты на тур', type: 'text' },
      { name: 'storeUrl', label: 'Магазин мерча', type: 'text' },
      { name: 'officialSite', label: 'Официальный сайт', type: 'text' },
      { name: 'bookingEmail', label: 'Почта для букинга', type: 'text' },
      { name: 'prEmail', label: 'Почта для PR', type: 'text' },
      { name: 'ownerName', label: 'Владелец сайта: ФИО или название (для правовых документов)', type: 'text' },
      { name: 'ownerLocation', label: 'Владелец сайта: страна и город', type: 'text' },
      { name: 'ownerEmail', label: 'Почта для обращений по персональным данным и правам', type: 'text' },
      { name: 'legalUpdated', label: 'Дата редакции правовых документов', type: 'date' }
    ]
  },
  {
    key: 'organizers', title: 'Организаторам', kind: 'single', private: true,
    hint: 'Закрытый блок: эти данные видны только после ввода кода. Лучше задать код длиннее четырёх цифр.',
    fields: [
      { name: 'pin', label: 'Код доступа (только цифры)', type: 'text', required: true, digits: true },
      i18n('bio', 'Пресс-релиз (организаторы копируют его в афиши)', { multiline: true }),
      {
        name: 'photos', label: 'Промо-фото', type: 'list', itemTitle: (p) => p.caption?.ru || 'Фото',
        newItem: () => ({ src: null, caption: { ru: '', en: '' } }),
        fields: [{ name: 'src', label: 'Фото', type: 'image' }, i18n('caption', 'Подпись')]
      },
      {
        name: 'docs', label: 'Документы', type: 'list', itemTitle: (d) => d.title?.ru || 'Документ',
        newItem: () => ({ title: { ru: '', en: '' }, url: null }),
        fields: [i18n('title', 'Название', { required: true }), { name: 'url', label: 'Файл', type: 'file' }]
      }
    ]
  }
]

export const blockDefault = (b) => (b.key === 'organizers' ? DEFAULT_ORG : DEFAULTS[b.key])

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

// Сохраняем только поля из схемы: оформление из кода не попадёт в базу и не «застынет»
export function pick(obj, fields) {
  const out = {}
  if (obj && obj.id != null) out.id = obj.id
  fields.forEach((f) => {
    const v = obj?.[f.name]
    if (f.type === 'list') out[f.name] = (v || []).map((x) => pick(x, f.fields))
    else if (v !== undefined) out[f.name] = v
  })
  return out
}

export function sanitize(block, data) {
  if (block.kind === 'single') return pick(data, block.fields)
  return (data || []).map((it) => pick(it.id ? it : { ...it, id: newId() }, block.fields))
}

// Проверка обязательных полей: возвращает список понятных ошибок
export function validate(block, data) {
  const errs = []
  const checkFields = (obj, fields, where) => {
    fields.forEach((f) => {
      if (f.showIf && !f.showIf(obj)) return
      const v = obj?.[f.name]
      if (f.required) {
        const empty = f.type === 'i18n' ? !v?.ru?.trim() : (v == null || String(v).trim() === '')
        if (empty) errs.push(`${where}: заполните «${f.label}»`)
      }
      if (f.digits && v && !/^\d{4,8}$/.test(v)) errs.push(`${where}: код должен состоять из 4-8 цифр`)
      if (f.type === 'list') (v || []).forEach((x, i) => checkFields(x, f.fields, `${where}, ${f.label} №${i + 1}`))
    })
  }
  if (block.kind === 'single') checkFields(data, block.fields, block.title)
  else (data || []).forEach((it, i) => checkFields(it, block.fields, `${block.itemTitle?.(it) || block.title} (№${i + 1})`))
  return errs
}
