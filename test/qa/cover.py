import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("""try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}
          window.__logoAt = null; (function poll(){ const j=document.querySelector('.cover-jelly'); const pl=document.querySelector('.preloader');
            if (j && !window.__logoAt && +getComputedStyle(j).opacity > 0.05 && getComputedStyle(j).transform !== 'none') window.__logoAt = performance.now();
            if (!window.__logoAt) requestAnimationFrame(poll) })()""")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(5000)
        t = await pg.evaluate("({load: Math.round(performance.getEntriesByType('navigation')[0].loadEventEnd), logo: Math.round(window.__logoAt||-1)})")
        print('загрузка страницы:', t['load'], 'мс | логотип начал появляться:', t['logo'], 'мс | разница:', t['logo']-t['load'], 'мс')
        print('фон обложки (эра):', await pg.evaluate("window.__store?.eraTarget ?? 'n/a'"))
        await pg.screenshot(path='/tmp/cv1.png')
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H}*{0.5/11.2})'); await pg.wait_for_timeout(2500); await pg.screenshot(path='/tmp/cv2.png')
        m = await b.new_page(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True)
        await m.goto('http://localhost:4173/'); await m.wait_for_timeout(4500); await m.screenshot(path='/tmp/cv3.png')
        print('errors', errs); await b.close()
asyncio.run(main())
