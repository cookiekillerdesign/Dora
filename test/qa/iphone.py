import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
def p(*a): print(*a, flush=True)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width':390,'height':664}, has_touch=True, is_mobile=True, user_agent=UA, device_scale_factor=1)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        cdp = await ctx.new_cdp_session(pg)
        async def swipe(dy, y0=500):
            await cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[{'x':195,'y':y0}]})
            for k in range(1,9):
                await cdp.send('Input.dispatchTouchEvent', {'type':'touchMove','touchPoints':[{'x':195,'y':y0-dy*k/8}]}); await pg.wait_for_timeout(16)
            await cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
        # 3. обложка после касаний и скролла
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2800)
        b1 = await pg.locator('.cover-l').nth(3).bounding_box()
        await swipe(30, y0=int(b1['y']+b1['height']/2)); await pg.wait_for_timeout(600)
        await swipe(200); await pg.wait_for_timeout(800); await swipe(-260, y0=200); await pg.wait_for_timeout(1500)
        st = await pg.evaluate("[...document.querySelectorAll('.cover-l')].map(l=>[getComputedStyle(l).transform, l.style.getPropertyValue('--near')||'0'])")
        p('ОБЛОЖКА: буквы на месте после касаний и скролла ->', 'PASS' if all(t in ('none','matrix(1, 0, 0, 1, 0, 0)') and float(n or 0)==0 for t,n in st) else 'FAIL', st)
        await pg.evaluate('window.scrollTo(0,0)'); await pg.wait_for_timeout(1000); await pg.screenshot(path='/tmp/i_cover.png')
        # 2a. меню: все пункты целиком
        await pg.tap('.nav-burger'); await pg.wait_for_timeout(1200)
        fit = await pg.evaluate("[...document.querySelectorAll('.menu-link')].map(a=>({t:a.textContent, w:Math.round(a.getBoundingClientRect().right), over: a.scrollWidth>a.clientWidth+1}))")
        p('МЕНЮ: все пункты влезают в экран 390 ->', 'PASS' if all(x['w']<=390-8 and not x['over'] for x in fit) else 'FAIL', [(x['t'],x['w']) for x in fit])
        await pg.screenshot(path='/tmp/i_menu.png'); await pg.tap('.nav-burger'); await pg.wait_for_timeout(600)
        for w in [320, 360]:
            c2 = await b.new_context(viewport={'width':w,'height':640}, has_touch=True, is_mobile=True, user_agent=UA)
            m = await c2.new_page()
            await m.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await m.goto('http://localhost:4173/#/tour'); await m.wait_for_timeout(3500)
            await m.tap('.nav-burger'); await m.wait_for_timeout(1100)
            mx = await m.evaluate("Math.max(...[...document.querySelectorAll('.menu-link')].map(a=>a.getBoundingClientRect().right))")
            await m.tap('.nav-burger'); await m.wait_for_timeout(700)
            closed = await m.locator('.menu').count()==0
            p(f'МЕНЮ на {w}px: открывается, всё влезает (край {round(mx)}), закрывается ->', 'PASS' if mx <= w-6 and closed else 'FAIL')
            await c2.close()
        await pg.set_viewport_size({'width':390,'height':664})
        # 2b. организаторы: нет автофокуса, кнопка
        await pg.goto('http://localhost:4173/#/organizers'); await pg.wait_for_timeout(2000)
        p('ОРГАНИЗАТОРЫ: клавиатура не открывается сама ->', 'PASS' if await pg.evaluate("document.activeElement.id!=='pin'") else 'FAIL')
        p('ОРГАНИЗАТОРЫ: поле не «пароль» (без полосы автозаполнения) ->', 'PASS' if await pg.evaluate("document.getElementById('pin').type==='text'") else 'FAIL')
        ov = await pg.evaluate("(()=>{const p=document.querySelector('.pass').getBoundingClientRect(); return [...document.querySelectorAll('.pass *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && (r.right>p.right+1||r.left<p.left-1) && !e.classList.contains('pass-hole')}).map(e=>e.className)})()")
        p('ОРГАНИЗАТОРЫ: ничего не вылезает за пропуск ->', 'PASS' if not ov else 'FAIL', ov[:3])
        await pg.screenshot(path='/tmp/i_org.png')
        # имитация клавиатуры: окно ниже на 300px, фокус
        await pg.tap('.gate-slots'); await pg.set_viewport_size({'width':390,'height':364}); await pg.wait_for_timeout(1200)
        vis = await pg.evaluate("(()=>{const s=document.querySelector('.gate-slots').getBoundingClientRect(); return s.top>=0 && s.bottom<=innerHeight})()")
        p('ОРГАНИЗАТОРЫ: при открытой клавиатуре ячейки видны ->', 'PASS' if vis else 'FAIL')
        await pg.screenshot(path='/tmp/i_org_kb.png')
        await pg.keyboard.type('1111'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1200)
        p('ОРГАНИЗАТОРЫ: вход по коду с телефона ->', 'PASS' if await pg.locator('.org--open').count()==1 else 'FAIL')
        await pg.set_viewport_size({'width':390,'height':664})
        # 1. тур
        await pg.goto('http://localhost:4173/#/tour'); await pg.wait_for_timeout(1500)
        hs = await pg.evaluate("[...document.querySelectorAll('.ticket')].slice(0,4).map(t=>Math.round(t.getBoundingClientRect().height))")
        p('ТУР: компактные карточки (высота) ->', 'PASS' if max(hs)<=110 else 'FAIL', hs)
        await pg.evaluate('window.scrollTo(0,420)'); await pg.wait_for_timeout(700)
        p('ТУР: шапка получила подложку при прокрутке ->', 'PASS' if await pg.locator('.nav--solid').count()==1 else 'FAIL')
        await pg.screenshot(path='/tmp/i_tour.png')
        ov = await pg.evaluate('document.documentElement.scrollWidth - innerWidth')
        p('ТУР: без переполнения ->', 'PASS' if ov<=1 else 'FAIL', ov, '| errors', errs)
        await b.close()
asyncio.run(main())
