import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
R=[]
def ok(n,c,e=''): R.append(c); print('PASS' if c else 'FAIL', n, e, flush=True)
ANG="(()=>{const c=document.querySelector('.turntable'); return c.toDataURL().length})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'all'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/#/music'); await pg.wait_for_timeout(3500)
        n_album = await pg.locator('.jcard-track--album').count()
        ok('у каждого альбома есть строка «Весь альбом»', n_album==5, n_album)
        ok('по умолчанию выбран весь альбом кьют-рока', 'Боже, храни кьют-рок' in await pg.locator('.stage-track').inner_text() and '9 треков' in await pg.locator('.stage-meta').inner_text())
        src = await pg.evaluate("(document.querySelector('.player iframe')||{}).src||''")
        ok('в плеере альбом целиком (в превью - запасной iframe)', '/embed/album/7hDvB29vtfPYypzxaxnMpT' in src, src[:70])
        ok('пока музыка не играет, видна подсказка «нажми play»', await pg.locator('.play-hint').count()==1)
        a1 = await pg.evaluate(ANG); await pg.wait_for_timeout(1500); a2 = await pg.evaluate(ANG)
        # сравниваем картинку холста: в покое она не должна меняться
        img1 = await pg.locator('.turntable').screenshot(); await pg.wait_for_timeout(1200); img2 = await pg.locator('.turntable').screenshot()
        ok('пластинка не крутится, пока музыка не играет', img1==img2)
        await pg.locator('.jcard-track--album').nth(3).click(); await pg.wait_for_timeout(1500)
        src = await pg.evaluate("(document.querySelector('.player iframe')||{}).src||''")
        ok('клик по «Весь альбом» MISS загружает альбом MISS', '2umHPKn2Mggn9RUqT8beQy' in src and '13 треков' in await pg.locator('.stage-meta').inner_text())
        await pg.locator('.jcard-track:has-text("Дорадура")').click(); await pg.wait_for_timeout(1200)
        src = await pg.evaluate("(document.querySelector('.player iframe')||{}).src||''")
        ok('«Дорадура» теперь играет на сайте', '4mTPviBGRgjPxeaQFnBDW3' in src)
        # имитация «плеер заиграл» в запасном режиме: фокус уходит в iframe
        await pg.evaluate("document.querySelector('.player iframe').focus(); window.dispatchEvent(new Event('blur'))"); await pg.wait_for_timeout(1500)
        img3 = await pg.locator('.turntable').screenshot(); await pg.wait_for_timeout(700); img4 = await pg.locator('.turntable').screenshot()
        ok('когда пошла музыка, пластинка крутится и подсказка уходит', img3!=img4 and await pg.locator('.play-hint').count()==0)
        await pg.screenshot(path='/tmp/mus1.png')
        m = await b.new_page(viewport={'width':390,'height':844})
        await m.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'all'})) } catch(e) {}")
        await m.goto('http://localhost:4173/#/music?era=miss'); await m.wait_for_timeout(3000)
        ok('телефон: подсказка и плеер без переполнения', await m.evaluate('document.documentElement.scrollWidth - innerWidth')<=1)
        await m.screenshot(path='/tmp/mus2.png')
        print('errors', errs, '| итого', sum(R), 'из', len(R))
        await b.close()
asyncio.run(main())
