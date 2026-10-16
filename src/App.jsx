import { useEffect, useState } from 'react'
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { LangProvider, useLang } from './i18n'
import { ContentProvider } from './content/ContentProvider'
import EraCanvas from './gl/EraCanvas'
import Nav from './components/Nav'
import Preloader from './components/Preloader'
import DuraEgg from './components/DuraEgg'
import Home from './pages/home/Home'
import Music from './pages/Music'
import Organizers from './pages/Organizers'
import Merch from './pages/Merch'
import Video from './pages/Video'
import Product from './pages/Product'
import Tour from './pages/Tour'
import News from './pages/News'
import Admin from './pages/Admin'
import Legal from './pages/Legal'
import ConsentBanner from './components/ConsentBanner'
import Cursor from './components/Cursor'
import { initSmooth, getLenis, ScrollTrigger } from './lib/smooth'

const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

const TITLES = { '/music': 'music', '/video': 'video', '/tour': 'tour', '/news': 'news', '/merch': 'merch', '/organizers': 'org' }
function TitleSync() {
  const { pathname } = useLocation()
  const { t } = useLang()
  useEffect(() => {
    const k = TITLES[pathname]
    if (pathname.startsWith('/merch/') || ['/legal', '/privacy', '/cookies', '/terms'].includes(pathname)) return // заголовок ставит сама страница
    document.title = pathname === '/admin' ? 'Админка | дора' : k ? `${t.nav[k]} | дора` : 'дора'
  }, [pathname, t])
  return null
}

function SiteNav() {
  const { pathname } = useLocation()
  return pathname === '/admin' ? null : <Nav />
}

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    const top = () => { getLenis()?.scrollTo(0, { immediate: true }); window.scrollTo(0, 0) }
    top()
    // ScrollTrigger при пересчёте возвращает запомненную позицию прокрутки. На телефоне (без Lenis)
    // он не успевает узнать о сбросе и вернул бы низ прошлой страницы. Поэтому стираем его память,
    // пересчитываем и ставим страницу в начало уже после пересчёта.
    ScrollTrigger.clearScrollMemory()
    const id = requestAnimationFrame(() => { ScrollTrigger.refresh(); top() })
    return () => cancelAnimationFrame(id)
  }, [pathname])
  return null
}

export default function App() {
  useEffect(() => { initSmooth() }, [])
  return (
    <LangProvider>
      <ContentProvider>
      <Router>
        <TitleSync />
        <ScrollReset />
        <EraCanvas />
        <SiteNav />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/music" element={<Music />} />
            <Route path="/tour" element={<Tour />} />
            <Route path="/news" element={<News />} />
            <Route path="/video" element={<Video />} />
            <Route path="/merch" element={<Merch />} />
            <Route path="/merch/:id" element={<Product />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/cookies" element={<Legal />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/organizers" element={<Organizers />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <DuraEgg />
        <ConsentBanner />
        <Cursor />
        <Preloader />
      </Router>
      </ContentProvider>
    </LangProvider>
  )
}
