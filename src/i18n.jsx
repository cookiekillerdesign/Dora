import { createContext, useContext, useEffect, useState } from 'react'
import { safeGet, safeSet } from './lib/storage'

const dict = {
  ru: {
    nav: { home: 'Плёнка', music: 'Музыка', video: 'Видео', tour: 'Тур', news: 'Анонсы', merch: 'Мерч', org: 'Организаторам', menu: 'Меню', close: 'Закрыть', label: 'Основное меню', lang: 'EN', langLabel: 'Switch to English' },
    hero: { sub: 'Шесть глав из жизни девчонки из Саратова, от тетрадки до Японии.', hint: 'Листай вниз, лента поедет вбок', logoLabel: 'Логотип «дора»: нажми, он желейный' },
    outro: {
      title: 'Дальше только Лунтик и музыка',
      music: 'Вся музыка',
      org: 'Я организатор',
      note: 'Неофициальный фан-сайт, сделан в подарок артистке. Музыка и обложки принадлежат правообладателям, плеер работает через Spotify.'
    },
    dura: 'Дорадура-режим включён',
    call: { from: 'мама', incoming: 'входящий вызов', answer: 'Ответить', decline: 'Сбросить', question: 'Что такое любовь?', after: 'Ответ в следующих песнях.', declined: 'Перезвоните, когда будете готовы.', hangup: 'Положить трубку', missed: 'Пропущенный вызов', ended: 'Вызов завершён', callback: 'Перезвонить' },
    it: { label: 'Итальянская версия' },
    singlesLabel: 'Последние синглы',
    tape: 'Перемотка плёнки',
    photo: { ph: 'фото', cover: 'обложка', show: 'Показать фото', hide: 'Спрятать фото' },
    eggs: { badge: 'Значок «дорадура»: наведи или нажми' },
    tour: {
      title: 'Тур 2026',
      lead: 'Все концерты на одной афише. Билеты продаются по официальной ссылке артистки.',
      all: 'Все билеты',
      tickets: 'Билеты',
      upcoming: 'Скоро',
      past: 'Уже отыграли',
      done: 'было',
      home: 'дома!',
      homeLabel: 'Концерт в родном городе',
      venueTbc: 'площадка уточняется',
      empty: 'Новые даты появятся здесь, как только их объявят.',
      note: 'Даты собраны с открытых афиш. Перед покупкой проверьте их на странице билетов.'
    },
    news: {
      title: 'Анонсы',
      sub: 'Релизы, концерты и новости тура: всё, что происходит у Доры сейчас.',
      all: 'Все',
      empty: 'Здесь пока пусто - новые анонсы скоро появятся.',
      read: 'Подробнее',
      listen: 'Слушать',
      kinds: { tour: 'Тур', release: 'Релиз', live: 'Концерт' },
      kindsPlural: { tour: 'Тур', release: 'Релизы', live: 'Концерты' }
    },
    video: {
      title: 'Видео', sub: 'Все клипы, от «Дорадуры» до новых синглов. Нажми на клип, и он заиграет в плеере.',
      list: 'Клипы', openYt: 'Открыть на YouTube', enable: 'Включить YouTube',
      gate: 'Плеер YouTube ставит свои cookie и передаёт данные Google. Включить его?'
    },
    legal: {
      docs: 'Документы', info: 'Сведения о владельце', privacy: 'Политика конфиденциальности', cookies: 'Политика cookie', terms: 'Пользовательское соглашение', settings: 'Настройки cookie',
      cookieTitle: 'Cookie на сайте',
      bannerText: 'Сайт хранит в браузере только язык и ваш выбор. Плееры Яндекс Музыки, Spotify и YouTube ставят свои cookie и получают данные о вашем устройстве, поэтому включаются только с вашего согласия.',
      onlyNecessary: 'Только необходимое', allowAll: 'Разрешить плееры', more: 'Подробнее',
      playerGate: 'Плееры Яндекс Музыки и Spotify ставят свои cookie и получают данные о вашем устройстве. Включить их?',
      enablePlayer: 'Включить плеер',
      fontCredit: 'Шрифты: Onest, Caveat, Neucha, Rubik Dirt, Unbounded, Playfair Display, Great Vibes, Dela Gothic One (SIL Open Font License).',
      metaNote: 'Instagram принадлежит компании Meta, признанной экстремистской организацией и запрещённой в России.'
    },
    socials: { title: 'Дора в сети', tour: 'Билеты на тур', site: 'Официальный сайт артистки' },
    merch: {
      title: 'Мерч',
      lead: 'Вещи из официального магазина Доры. Наклейки можно двигать мышкой, клик открывает товар в магазине.',
      all: 'Все товары в магазине',
      open: 'Открыть в официальном магазине',
      note: 'Ассортимент, цены и наличие смотрите в официальном магазине, он обновляется.',
      more: 'Подробнее',
      buy: 'Купить',
      inStore: 'в официальном магазине',
      buyNote: 'Покупка, оплата и доставка проходят в официальном магазине Доры. Этот сайт ничего не продаёт сам.',
      official: 'Официальный мерч',
      sizes: 'Размеры',
      priceNote: 'Актуальная цена в магазине',
      details: 'О вещи',
      back: 'Мерч',
      related: 'Ещё из мерча',
      notFound: 'Такого товара нет'
    },
    music: {
      title: 'Музыка',
      sub: 'Альбомы целиком и отдельные треки. Пластинка крутится, пока играет музыка.',
      albumRow: 'Весь альбом',
      consentTitle: 'Где будем слушать?',
      consentText: 'Плееры Яндекс Музыки и Spotify ставят свои cookie и получают данные о вашем устройстве. Выберите сервис - и музыка заиграет прямо здесь.',
      listenYandex: 'Яндекс Музыка', listenSpotify: 'Spotify', consentMore: 'Подробнее о cookie',
      singles: 'Синглы',
      service: 'Где слушать',
      openYandex: 'Открыть в Яндекс Музыке',
      yandexMissing: 'Этот релиз пока открывается в приложении Яндекс Музыки.',
      inAlbum: 'Трек играет в плеере альбома: выбери его в списке плеера.',
      allTracks: 'все треки',
      wholeAlbum: 'весь альбом',
      tracksWord: (n) => (n % 10 === 1 && n % 100 !== 11 ? 'трек' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'трека' : 'треков'),
      hintAlbum: 'Нажми ▶ в плеере или выбери любой трек из альбома, и пластинка закрутится',
      hintTrack: 'Нажми ▶ в плеере, и пластинка закрутится',

      open: 'Открыть в Spotify',
      noEmbed: 'Этот релиз пока открывается только в Spotify.',
      note: 'Полные треки играют, если вы вошли в свой аккаунт сервиса. Без входа обычно звучит отрывок.',
      fallback: 'Плеер не загрузился? Откройте трек в Spotify.'
    },
    org: {
      title: 'Организаторам',
      lead: 'Промо-фото, райдер и контакты для букинга.',
      code: 'Код доступа',
      hint: 'Код выдаёт команда артистки.',
      open: 'Войти в бэкстейдж',
      checking: 'Проверяем…',
      download: 'Скачать',
      wrong: 'Код не подошёл. Проверьте цифры и попробуйте снова.',
      photos: 'Промо-фото',
      photoPh: 'Место для промо-фото',
      docs: 'Документы',
      soon: 'Файл скоро',
      docsList: ['Технический райдер', 'Бытовой райдер', 'Сценический план', 'Логотипы и пресс-релиз'],
      contacts: 'Контакты',
      booking: 'Букинг',
      pr: 'PR и сотрудничество',
      tour: 'Даты тура',
      lock: 'Закрыть доступ',
      pass: 'Бэкстейдж',
      passSub: 'Только для организаторов',
      bio: 'Пресс-релиз',
      copy: 'Скопировать',
      copied: 'Скопировано',
      frame: 'Кадр',
      fileSoon: 'Скоро будет',
      write: 'Написать'
    }
  },
  en: {
    nav: { home: 'Tape', music: 'Music', video: 'Video', tour: 'Tour', news: 'News', merch: 'Merch', org: 'Promoters', menu: 'Menu', close: 'Close', label: 'Main menu', lang: 'RU', langLabel: 'Переключить на русский' },
    hero: { sub: 'Six chapters from the life of a girl from Saratov, from a school notebook to Japan.', hint: 'Scroll down, the tape moves sideways', logoLabel: 'Dora logo: press it, it’s jelly' },
    outro: {
      title: 'Only Luntik and music from here',
      music: 'All the music',
      org: 'I’m a promoter',
      note: 'Unofficial fan site, made as a gift to the artist. Music and artwork belong to their rights holders; the player runs on Spotify.'
    },
    dura: 'Doradura mode on',
    call: { from: 'mom', incoming: 'incoming call', answer: 'Answer', decline: 'Decline', question: 'What is love?', after: 'The answer is in the songs that follow.', declined: 'Call back when you’re ready.', hangup: 'Hang up', missed: 'Missed call', ended: 'Call ended', callback: 'Call back' },
    it: { label: 'Italian version' },
    singlesLabel: 'Latest singles',
    tape: 'Rewind the tape',
    photo: { ph: 'photo', cover: 'cover', show: 'Show the photo', hide: 'Hide the photo' },
    eggs: { badge: '“Doradura” badge: hover or press' },
    tour: {
      title: 'Tour 2026',
      lead: 'Every show on one poster. Tickets are sold through the artist’s official link.',
      all: 'All tickets',
      tickets: 'Tickets',
      upcoming: 'Upcoming',
      past: 'Already played',
      done: 'played',
      home: 'home!',
      homeLabel: 'Hometown show',
      venueTbc: 'venue to be confirmed',
      empty: 'New dates will appear here as soon as they are announced.',
      note: 'Dates are collected from public listings. Check them on the tickets page before you buy.'
    },
    news: {
      title: 'News',
      sub: 'Releases, shows and tour news: everything happening with Dora right now.',
      all: 'All',
      empty: 'Nothing here yet - new announcements are coming soon.',
      read: 'Read more',
      listen: 'Listen',
      kinds: { tour: 'Tour', release: 'Release', live: 'Show' },
      kindsPlural: { tour: 'Tour', release: 'Releases', live: 'Shows' }
    },
    video: {
      title: 'Video', sub: 'Every music video, from “Дорадура” to the latest singles. Press a video to play it.',
      list: 'Videos', openYt: 'Open on YouTube', enable: 'Turn on YouTube',
      gate: 'The YouTube player sets its own cookies and shares data with Google. Turn it on?'
    },
    legal: {
      docs: 'Documents', info: 'Site owner', privacy: 'Privacy policy', cookies: 'Cookie policy', terms: 'Terms of use', settings: 'Cookie settings',
      cookieTitle: 'Cookies on this site',
      bannerText: 'This site stores only your language and your choice in the browser. The Yandex Music, Spotify and YouTube players set their own cookies and receive device data, so they load only with your consent.',
      onlyNecessary: 'Necessary only', allowAll: 'Allow players', more: 'Learn more',
      playerGate: 'The Yandex Music and Spotify players set their own cookies and receive device data. Turn them on?',
      enablePlayer: 'Turn on player',
      fontCredit: 'Fonts: Onest, Caveat, Neucha, Rubik Dirt, Unbounded, Playfair Display, Great Vibes, Dela Gothic One (SIL Open Font License).',
      metaNote: 'Instagram is owned by Meta, which is designated an extremist organisation and banned in Russia.'
    },
    socials: { title: 'Dora online', tour: 'Tour tickets', site: 'Artist’s official site' },
    merch: {
      title: 'Merch',
      lead: 'Items from Dora’s official store. Drag the stickers around; a click opens the item in the store.',
      all: 'See everything in the store',
      open: 'Open in the official store',
      note: 'Check the official store for the current range, prices and stock.',
      more: 'Details',
      buy: 'Buy',
      inStore: 'in the official store',
      buyNote: 'Purchase, payment and delivery happen in Dora’s official store. This site doesn’t sell anything itself.',
      official: 'Official merch',
      sizes: 'Sizes',
      priceNote: 'See the current price in the store',
      details: 'About this item',
      back: 'Merch',
      related: 'More merch',
      notFound: 'No such item'
    },
    music: {
      title: 'Music',
      sub: 'Whole albums and single tracks. The record spins while the music plays.',
      albumRow: 'Whole album',
      consentTitle: 'Where shall we listen?',
      consentText: 'The Yandex Music and Spotify players set their own cookies and receive device data. Pick a service and the music plays right here.',
      listenYandex: 'Yandex Music', listenSpotify: 'Spotify', consentMore: 'More about cookies',
      singles: 'Singles',
      service: 'Where to listen',
      openYandex: 'Open in Yandex Music',
      yandexMissing: 'This release opens in the Yandex Music app for now.',
      inAlbum: 'This track plays inside the album player: pick it in the player list.',
      allTracks: 'all tracks',
      wholeAlbum: 'whole album',
      tracksWord: (n) => (n === 1 ? 'track' : 'tracks'),
      hintAlbum: 'Press ▶ in the player or pick any track from the album, and the record starts spinning',
      hintTrack: 'Press ▶ in the player, and the record starts spinning',

      open: 'Open in Spotify',
      noEmbed: 'This release opens in Spotify for now.',
      note: 'Full tracks play if you are logged in to the service. Otherwise you usually hear a preview.',
      fallback: 'Player didn’t load? Open the track in Spotify.'
    },
    org: {
      title: 'Promoters',
      lead: 'Promo photos, rider and booking contacts.',
      code: 'Access code',
      hint: 'The artist’s team gives out the code.',
      open: 'Enter backstage',
      checking: 'Checking…',
      download: 'Download',
      wrong: 'That code didn’t work. Check the digits and try again.',
      photos: 'Promo photos',
      photoPh: 'Promo photo goes here',
      docs: 'Documents',
      soon: 'File coming soon',
      docsList: ['Technical rider', 'Hospitality rider', 'Stage plot', 'Logos and press release'],
      contacts: 'Contacts',
      booking: 'Booking',
      pr: 'PR and partnerships',
      tour: 'Tour dates',
      lock: 'Lock access',
      pass: 'Backstage',
      passSub: 'Promoters only',
      bio: 'Press release',
      copy: 'Copy',
      copied: 'Copied',
      frame: 'Frame',
      fileSoon: 'Coming soon',
      write: 'Write'
    }
  }
}

const Ctx = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => (safeGet('dora-lang') === 'en' ? 'en' : 'ru'))
  useEffect(() => { safeSet('dora-lang', lang); document.documentElement.lang = lang }, [lang])
  return <Ctx.Provider value={{ lang, setLang, t: dict[lang] }}>{children}</Ctx.Provider>
}
export const useLang = () => useContext(Ctx)
