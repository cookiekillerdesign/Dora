import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
R=[]
def ok(n,c,e=''): R.append(c); print('PASS' if c else 'FAIL', n, e, flush=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:4173/#/music?era=sister'); await pg.wait_for_timeout(3500)
        # колесо над пластинкой и над названием
        for sel in ['.stage-deck', '.stage-track']:
            bb = await pg.locator(sel).bounding_box()
            before = await pg.evaluate("document.querySelector('.jcard').scrollTop")
            await pg.mouse.move(bb['x']+bb['width']/2, bb['y']+bb['height']/2)
            for _ in range(3): await pg.mouse.wheel(0, 250); await pg.wait_for_timeout(150)
            await pg.wait_for_timeout(500)
            after = await pg.evaluate("document.querySelector('.jcard').scrollTop"); y = await pg.evaluate('scrollY')
            ok(f'колесо над {sel}: список прокрутился, страница стоит', after > before and y == 0, f'список {before}->{after}, страница {y}')
        await pg.evaluate("document.querySelector('.jcard').scrollTop=0")
        ok('без согласия: оповещение «Где будем слушать?»', await pg.locator('.pconsent').count()==1)
        await pg.screenshot(path='/tmp/pc_d.png')
        await pg.click('.pconsent-btn--spotify'); await pg.wait_for_selector('.player iframe', timeout=15000); await pg.wait_for_timeout(500)
        st = await pg.evaluate("({consent: JSON.parse(localStorage.getItem('dora-consent')).value, svc: localStorage.getItem('dora-player'), src: (document.querySelector('.player iframe')||{}).src||''})")
        ok('кнопка Spotify: согласие + Spotify включён', st['consent']=='all' and st['svc']=='spotify' and 'spotify' in st['src'] and await pg.locator('.svc-btn--spotify.is-on').count()==1, st['src'][:50])
        await pg.evaluate("localStorage.removeItem('dora-consent'); localStorage.removeItem('dora-player')"); await pg.reload(); await pg.wait_for_timeout(3000)
        await pg.click('.pconsent-btn--yandex'); await pg.wait_for_timeout(1500)
        src = await pg.evaluate("(document.querySelector('.player-frame--yandex')||{}).src||''")
        ok('кнопка Яндекс Музыка: согласие + плеер Яндекса', 'music.yandex.ru/iframe/album/8886142' in src and await pg.locator('.svc-btn--yandex.is-on').count()==1, src[:60])
        m = await b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True); mp = await m.new_page()
        await mp.goto('http://localhost:4173/#/music'); await mp.wait_for_timeout(3000)
        await mp.screenshot(path='/tmp/pc_m.png')
        await mp.evaluate('window.scrollTo(0, 600)'); await mp.wait_for_timeout(500)
        ok('телефон: страница прокручивается как обычно', await mp.evaluate('scrollY') > 500 and await mp.evaluate('document.documentElement.scrollWidth-innerWidth')<=1)
        print('errors', errs, '| итого', sum(R), 'из', len(R)); await b.close()
asyncio.run(main())
