import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def wait_letters(pg, limit=10000):
    t=0
    while t<limit:
        ops = await pg.evaluate("[...document.querySelectorAll('.cr-hit-chars span')].map(s=>+getComputedStyle(s).opacity)")
        if ops and all(o>=0.99 for o in ops): return ops, t
        await pg.wait_for_timeout(300); t+=300
    return ops, t

async def goto_ch(pg, i):
    # середина паузы главы i (1..6): лента из 8 панелей, переезд 1, пауза 0.7
    T = 7 + 6 * 0.7
    mid = (i + (i - 1) * 0.7 + 0.35) / T
    await pg.evaluate(f"window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * {mid})")

R=[]
def ok(n,c,e=''): R.append(('PASS' if c else 'FAIL',n,e))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})); localStorage.setItem('dora-player','spotify') } catch (e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2800)
        await pg.evaluate("window.__fx={sister:0,miss:0}; new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.classList&&n.classList.contains('fx-p')){ const p=m.target.className||''; if(p.includes('sister')) __fx.sister++; if(p.includes('miss')) __fx.miss++ } }))).observe(document.body,{childList:true,subtree:true})")
        # обложка: желейный логотип - по клику трясётся и рассыпает звёзды
        await pg.evaluate("window.__fxc=0; new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.classList&&n.classList.contains('fx-p')) __fxc++ }))).observe(document.body,{childList:true,subtree:true})")
        await pg.click('.cover-logo'); await pg.wait_for_timeout(250)
        sx = await pg.evaluate("getComputedStyle(document.querySelector('.cover-jelly')).transform")
        ok('обложка: логотип трясётся и рассыпает звёзды', await pg.evaluate('__fxc')>0 and sx!='none', sx[:30])
        # пролог: росчерки дорисованы
        await goto_ch(pg, 1); await pg.wait_for_timeout(4000)
        off = await pg.evaluate("[...document.querySelectorAll('.pro-scribble path')].map(p=>getComputedStyle(p).strokeDashoffset)")
        ok('пролог: зачёркивание дорисовано', all(o in ('0','0px') for o in off), off)
        # младшая сестра: клик по значку даёт частицы
        await goto_ch(pg, 2); await pg.wait_for_timeout(3500)
        await pg.click('.sis-badge', force=True); await pg.wait_for_timeout(150)
        await pg.wait_for_timeout(300)
        ok('значок «дорадура»: клик рассыпает звёзды', await pg.evaluate('__fx.sister')>0, await pg.evaluate('__fx.sister'))
        # кьют-рок: переворот слова
        await goto_ch(pg, 3); await pg.wait_for_timeout(3500)
        await pg.locator('.cr-it').dispatch_event('click'); await pg.wait_for_timeout(3500)
        ok('IT: слово перевернулось в Innamorata', (await pg.locator('.cr-hit').get_attribute('data-word'))=='Innamorata')
        ops, waited = await wait_letters(pg)
        ok('IT: буквы на месте после анимации', all(o>=0.99 for o in ops), f'ждали {waited} мс')
        await pg.locator('.cr-it').dispatch_event('click'); await pg.locator('.cr-it').dispatch_event('click'); await pg.locator('.cr-it').dispatch_event('click'); await pg.wait_for_timeout(6000)
        ops, waited = await wait_letters(pg)
        ok('IT: быстрые клики не ломают слово', (await pg.locator('.cr-hit').get_attribute('data-word')) in ('Innamorata','Втюрилась') and all(o>=0.99 for o in ops), ops)
        lab = await pg.locator('.cr-hit').get_attribute('data-word'); pressed = await pg.locator('.cr-it').get_attribute('aria-pressed')
        ok('IT: переключатель и слово совпадают', (lab=='Innamorata')==(pressed=='true'), f'{lab} / {pressed}')
        # MISS: след из страз
        await goto_ch(pg, 4); await pg.wait_for_timeout(3500)
        for k in range(12): await pg.mouse.move(500+k*30, 450+k*5); await pg.wait_for_timeout(60)
        ok('MISS: стразы за курсором', await pg.evaluate('__fx.miss')>0, await pg.evaluate('__fx.miss'))
        # звонок
        await goto_ch(pg, 5); await pg.wait_for_timeout(3500)
        await pg.locator('.call-btn--yes').dispatch_event('click'); await pg.wait_for_timeout(3600)
        ok('звонок: таймер идёт', (await pg.locator('.call-status').inner_text())!='00:00')
        ok('звонок: вопрос напечатан', 'любовь' in await pg.locator('.call-question').inner_text())
        await pg.locator('.call-btn--no').dispatch_event('click'); await pg.wait_for_timeout(500)
        ok('звонок: завершён с длительностью', 'завершён' in await pg.locator('.call-status').inner_text())
        await pg.locator('.call-btn--yes').dispatch_event('click'); await pg.wait_for_timeout(500)
        await pg.locator('.call-btn--no').dispatch_event('click'); await pg.wait_for_timeout(500)
        ok('звонок: сброс = пропущенный', 'Пропущенный' in await pg.locator('.call-status').inner_text())
        ws = await pg.evaluate("[...document.querySelectorAll('.call-actions .call-btn')].map(b=>Math.round(b.getBoundingClientRect().width))")
        await pg.locator('.call-btn--yes').dispatch_event('click'); await pg.wait_for_timeout(500)
        ws2 = await pg.evaluate("[...document.querySelectorAll('.call-actions .call-btn')].map(b=>Math.round(b.getBoundingClientRect().width))")
        ok('звонок: кнопки ответа одинаковые', len(ws2)==2 and ws2[0]==ws2[1], ws2)
        # сейчас: сингл ведёт на трек
        await goto_ch(pg, 6); await pg.wait_for_timeout(3500)
        await pg.locator('.now-cover a[aria-label="Million Dollar Baby"]').dispatch_event('click'); await pg.wait_for_selector('.player iframe', timeout=15000); await pg.wait_for_timeout(800)
        ok('сингл открывает свой трек', 'Million Dollar Baby' in await pg.locator('.stage-track').inner_text() and '4LsYvt' in (await pg.locator('.player iframe').get_attribute('src') or ''))
        # пасхалка
        await pg.goto('http://localhost:4173/#/tour'); await pg.wait_for_timeout(1000)
        await pg.keyboard.type('dora'); await pg.wait_for_timeout(1200)
        n = await pg.locator('.dura-sticker').count()
        spread = await pg.evaluate("(()=>{const xs=[...document.querySelectorAll('.dura-sticker')].map(e=>e.getBoundingClientRect().left); return Math.max(...xs)-Math.min(...xs)})()")
        ok('пасхалка: наклейки разлетелись', n==24 and spread>400, f'{n} шт, разброс {spread:.0f}px')
        await pg.wait_for_timeout(4200)
        ok('пасхалка: всё убрано', await pg.locator('.dura').count()==0)
        print('\n'.join(f'{a}  {n}  {e}' for a,n,e in R)); print('errors', errs)
        await b.close()
asyncio.run(main())
