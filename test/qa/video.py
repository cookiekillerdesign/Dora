import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
R=[]
def ok(n,c,e=''): R.append(c); print('PASS' if c else 'FAIL', n, e, flush=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; reqs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('request', lambda r: ('youtube' in r.url or 'ytimg' in r.url) and reqs.append(r.url))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(3500)
        ok('в меню есть «Видео»', await pg.locator('.nav-links a', has_text='Видео').count()==1)
        await pg.locator('.nav-links a', has_text='Видео').click(); await pg.wait_for_timeout(1500)
        ok('страница «Видео» открывается', await pg.locator('.video-title').count()==1 and 'Видео' in await pg.title())
        ok('8 клипов, новые сверху', await pg.locator('.video-card').count()==8 and '2026' in await pg.locator('.video-card-year').first.inner_text())
        ok('без согласия: ни одного запроса к YouTube', not reqs and await pg.locator('.video-gate').count()==1, reqs[:1])
        await pg.screenshot(path='/tmp/v1.png')
        await pg.locator('.video-gate .consent-btn--all').click(); await pg.wait_for_timeout(1500)
        src = await pg.evaluate("document.querySelector('.video-frame')?.src||''")
        ok('после согласия: плеер youtube-nocookie с первым клипом', 'youtube-nocookie.com/embed/' in src, src[:60])
        await pg.locator('.video-card', has_text='Розовые волосы').click(); await pg.wait_for_timeout(1500)
        src = await pg.evaluate("document.querySelector('.video-frame')?.src||''")
        ok('клик по клипу: он играет в плеере', 'heZqRIG7Dus' in src and 'autoplay=1' in src and 'Розовые волосы' in await pg.locator('.video-now-title').inner_text())
        ok('карточка играющего клипа подсвечена', 'Розовые волосы' in await pg.locator('.video-card.is-on').inner_text())
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(3000)
        labels = await pg.evaluate("document.querySelectorAll('.ep-ph-label, .ep-stamp, .ep-caption, .ep-strip-label').length")
        ok('на фото нет надписей', labels==0, labels)
        m = await b.new_page(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True)
        await m.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'all'})) } catch(e) {}")
        await m.goto('http://localhost:4173/#/video'); await m.wait_for_timeout(3000)
        ok('телефон: без переполнения', await m.evaluate('document.documentElement.scrollWidth-innerWidth')<=1)
        await m.screenshot(path='/tmp/v2.png', full_page=False)
        print('errors', errs, '| итого', sum(R), 'из', len(R)); await b.close()
asyncio.run(main())
