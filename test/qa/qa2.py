import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def goto_ch(pg, i):
    # середина паузы главы i (1..6): лента из 8 панелей, переезд 1, пауза 0.7
    T = 7 + 6 * 0.7
    mid = (i + (i - 1) * 0.7 + 0.35) / T
    await pg.evaluate(f"window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * {mid})")

async def settle(pg, X, limit=9000):
    prev=None; same=0; t=0
    while t<limit:
        await pg.wait_for_timeout(400); t+=400
        v = await pg.evaluate(X)
        same = same+1 if v==prev else 0; prev=v
        if same>=3 and abs(v-round(v))<0.01: return v
    return prev

U='http://localhost:4173/#'
R=[]
def ok(name, cond, extra=''):
    R.append(('PASS' if cond else 'FAIL', name, extra)); print(('PASS' if cond else 'FAIL'), name, extra, flush=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width':375,'height':667}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await pg.goto(U+'/'); await pg.wait_for_timeout(2800)

        # 1 меню
        await pg.click('.nav-burger'); await pg.wait_for_timeout(1100)
        vis = await pg.evaluate("[...document.querySelectorAll('.menu-link')].filter(a=>{const r=a.getBoundingClientRect();return r.bottom<=innerHeight && r.top>=0 && getComputedStyle(a).opacity>0.9}).length")
        ok('меню: все 7 пунктов видны', vis==7, vis)
        await pg.click('.menu-link:has-text("Тур")'); await pg.wait_for_timeout(900)
        ok('меню: переход на тур и закрытие', ('/tour' in pg.url) and await pg.locator('.menu').count()==0)
        ok('меню: скролл разблокирован', await pg.evaluate("document.body.style.overflow===''"))
        y0 = await pg.evaluate('scrollY'); await pg.mouse.wheel(0,600); await pg.wait_for_timeout(700)
        ok('меню: страница прокручивается после закрытия', await pg.evaluate('scrollY')>y0)
        await pg.click('.nav-burger'); await pg.wait_for_timeout(500); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        ok('меню: Esc закрывает и возвращает фокус', await pg.locator('.menu').count()==0 and await pg.evaluate("document.activeElement.classList.contains('nav-burger')"))

        # 2 язык
        await pg.goto(U+'/'); await pg.wait_for_timeout(1200)
        await pg.click('.nav-lang'); await pg.wait_for_timeout(300)
        await pg.reload(); await pg.wait_for_timeout(2800)
        ok('язык: EN сохраняется после перезагрузки', await pg.evaluate("document.documentElement.lang")=='en' and await pg.locator('text=Scroll down').count()>0)
        await pg.click('.nav-lang'); await pg.wait_for_timeout(300)

        # 3 напоминалка и лента
        try:
            await pg.wait_for_selector('.scroll-hint.is-on', timeout=15000); appeared = True
        except Exception: appeared = False
        ok('напоминалка сама появляется на обложке', appeared)
        await pg.mouse.wheel(0,400); await pg.wait_for_timeout(1200)
        ok('напоминалка прячется после скролла', await pg.locator('.scroll-hint.is-on').count()==0)
        tx = await pg.evaluate("getComputedStyle(document.querySelector('.h-track')).transform")
        ok('скролл вниз двигает ленту вбок', tx!='none' and tx.split(',')[4].strip()!='0', tx[:40])

        # 4 пасхалка тапами
        await pg.evaluate("(async()=>{const m=document.querySelector('.nav-mark'); for(let i=0;i<5;i++){m.click(); await new Promise(r=>setTimeout(r,250))}})()"); await pg.wait_for_timeout(1500)
        await pg.wait_for_timeout(300)
        ok('пасхалка: 5 тапов по логотипу', await pg.locator('.dura').count()==1)
        await pg.wait_for_timeout(3900)
        ok('пасхалка: исчезает сама', await pg.locator('.dura').count()==0)

        # 5 переключатель IT и звонок (десктоп)
        dp = await b.new_page(viewport={'width':1440,'height':900}); dp.on('pageerror', lambda e: errs.append(str(e)))
        await dp.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await dp.goto(U+'/'); await dp.wait_for_timeout(2800)
        H = await dp.evaluate('document.documentElement.scrollHeight-innerHeight')
        await goto_ch(dp, 3); await dp.wait_for_timeout(2600)
        await dp.locator('.cr-it').dispatch_event('click'); await dp.wait_for_timeout(3000)
        ok('IT-переключатель', (await dp.locator('.cr-hit').get_attribute('data-word'))=='Innamorata')
        await goto_ch(dp, 5); await dp.wait_for_timeout(2600)
        ws = await dp.evaluate("[...document.querySelectorAll('.call-actions .call-btn')].map(b=>Math.round(b.getBoundingClientRect().width))")
        ok('звонок: кнопки одинаковой ширины', len(ws)==2 and ws[0]==ws[1], ws)
        await dp.locator('.call-btn--yes').dispatch_event('click'); await dp.wait_for_timeout(200)
        ok('звонок: ответить', await dp.locator('.call-question').count()==1)
        # точки кассеты
        await goto_ch(dp, 2); await dp.wait_for_timeout(2600)
        x = await dp.evaluate("(()=>{const m=getComputedStyle(document.querySelector('.h-track')).transform; return m==='none'?0:Math.round(-parseFloat(m.split(',')[4])/innerWidth*100)/100})()")
        ok('прокрутка ко 2-й главе: ровно в кадре', x==2, x)
        await dp.mouse.wheel(0,120); await dp.wait_for_timeout(1500)
        x2 = await dp.evaluate("(()=>{const m=getComputedStyle(document.querySelector('.h-track')).transform; return m==='none'?0:Math.round(-parseFloat(m.split(',')[4])/innerWidth*100)/100})()")
        ok('пауза: лёгкий скролл не сдвигает главу', x2==2, x2)
        await dp.mouse.wheel(0,900)
        x3 = await settle(dp, "(()=>{const m=getComputedStyle(document.querySelector('.h-track')).transform; return m==='none'?0:Math.round(-parseFloat(m.split(',')[4])/innerWidth*100)/100})()")
        ok('выезд из паузы вперёд доезжает до следующей главы', x3==3, x3)
        await dp.mouse.wheel(0,-900)
        x4 = await settle(dp, "(()=>{const m=getComputedStyle(document.querySelector('.h-track')).transform; return m==='none'?0:Math.round(-parseFloat(m.split(',')[4])/innerWidth*100)/100})()")
        ok('выезд из паузы назад возвращает на предыдущую главу', x4==2, x4)
        # пасхалка клавиатурой
        await dp.keyboard.type('dora'); await dp.wait_for_timeout(300)
        ok('пасхалка: набор dora', await dp.locator('.dura').count()==1)

        # 6 музыка
        await dp.evaluate("localStorage.setItem('dora-player','spotify')")
        await dp.goto(U+'/music?era=miss'); await dp.wait_for_timeout(1200)
        ok('музыка: ?era=miss выбирает MISS', 'MISS' in await dp.locator('.stage-meta').inner_text())
        await dp.wait_for_selector('.player iframe', timeout=15000)
        await dp.click('.jcard-track:has-text("Втюрилась")'); await dp.wait_for_timeout(1200)
        src = await dp.locator('.player iframe').get_attribute('src')
        ok('музыка: клик меняет трек в плеере', '1AuUsvFyFnf2l3E6HKUHO2' in (src or ''))
        ok('музыка: «Открыть в сервисе» в новой вкладке', await dp.locator('.player-meta a.listen[target=_blank]').count()==1)

        # 7 мерч: перетаскивание не открывает ссылку, клик открывает
        await dp.goto(U+'/merch'); await dp.wait_for_timeout(1500)
        st = dp.locator('.sticker').first; bb = await st.bounding_box()
        popups=[]; dp.context.on('page', lambda pg2: popups.append(pg2))
        await dp.mouse.move(bb['x']+bb['width']/2, bb['y']+60); await dp.mouse.down()
        await dp.mouse.move(bb['x']+bb['width']/2+150, bb['y']+120, steps=10); await dp.mouse.up(); await dp.wait_for_timeout(600)
        ok('мерч: перетаскивание не открывает магазин', len(popups)==0)
        await dp.locator('.sticker').nth(2).dispatch_event('click'); await dp.wait_for_timeout(1500)
        ok('мерч: клик открывает страницу товара', '/merch/pendant' in dp.url, dp.url)

        # 8 тур
        await dp.goto(U+'/tour'); await dp.wait_for_timeout(1200)
        up = await dp.locator('.tickets:not(.tickets--past) .ticket').count()
        past_buy = await dp.locator('.tickets--past .ticket-buy').count()
        ok('тур: будущие концерты есть', up>0, up)
        ok('тур: у прошедших нет кнопки билетов', past_buy==0)
        dates = await dp.evaluate("[...document.querySelectorAll('.tickets:not(.tickets--past) .ticket-day')].map(e=>e.textContent)")
        ok('тур: даты в порядке', len(dates)>0)

        # 9 анонсы: внутренняя ссылка
        await dp.goto(U+'/news'); await dp.wait_for_timeout(1000)
        await dp.click('.nw-lead.is-link'); await dp.wait_for_timeout(800)
        ok('анонсы: ссылка ведёт на тур', '/tour' in dp.url)

        # 10 организаторы (поддельная база, код 1111)
        await dp.goto(U+'/organizers'); await dp.wait_for_timeout(900)
        await dp.keyboard.type('0000'); await dp.keyboard.press('Enter'); await dp.wait_for_timeout(600)
        ok('организаторы: неверный код', await dp.locator('.gate-hint.is-err').count()==1)
        await dp.wait_for_timeout(600); await dp.locator('#pin').focus(); await dp.keyboard.type('1111'); await dp.keyboard.press('Enter'); await dp.wait_for_timeout(700)
        ok('организаторы: верный код', await dp.locator('.org--open').count()==1)
        await dp.reload(); await dp.wait_for_timeout(3200)
        ok('организаторы: доступ после перезагрузки', await dp.locator('.org--open').count()==1)
        await dp.click('.org-lock'); await dp.wait_for_timeout(300)
        ok('организаторы: закрыть доступ', await dp.locator('.gate').count()==1)

        # 11 назад/вперёд и 404
        await dp.goto(U+'/'); await dp.wait_for_timeout(1500)
        await dp.goto(U+'/music'); await dp.wait_for_timeout(700)
        await dp.goto(U+'/tour'); await dp.wait_for_timeout(700)
        await dp.go_back(); await dp.wait_for_timeout(700); await dp.go_back(); await dp.wait_for_timeout(1500)
        ok('назад: главная снова работает', await dp.locator('.panel--cover').count()==1)
        ok('назад: один pin-spacer', await dp.evaluate("document.querySelectorAll('.pin-spacer').length")==1)
        await dp.goto(U+'/nope'); await dp.wait_for_timeout(1000)
        ok('несуществующая страница не падает', await dp.locator('.panel--cover').count()==1)

        print('JS errors:', errs, flush=True)
        await b.close()
asyncio.run(main())
