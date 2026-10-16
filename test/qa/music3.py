import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
R=[]
def ok(n,c,e=''): R.append(c); print('PASS' if c else 'FAIL', n, e, flush=True)
OVL="(()=>{const h=document.querySelector('.stage-track').getBoundingClientRect(), p=document.querySelector('.play-hint'); if(!p) return 'нет'; const r=p.getBoundingClientRect(); return r.top >= h.bottom-1 ? 'ok' : ('наезд '+Math.round(h.bottom-r.top)+'px')})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'all'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/#/music?era=now&track=Million%20Dollar%20Baby'); await pg.wait_for_timeout(3500)
        songs = await pg.locator('.jcard-track:not(.jcard-track--album)').count(); albums = await pg.locator('.jcard-track--album').count()
        ok('в списке все песни дискографии', songs==76 and albums==5, f'песен {songs}, альбомов {albums}')
        ok('по умолчанию в русской версии Яндекс Музыка', await pg.locator('.svc-btn--yandex.is-on').count()==1)
        ok('длинное название: подсказка не наезжает (или её нет без плеера)', (await pg.evaluate(OVL)) in ('ok','нет'), await pg.evaluate(OVL))
        await pg.screenshot(path='/tmp/m3a.png')
        await pg.locator('.jcard-track--album').nth(1).click(); await pg.wait_for_timeout(1200)
        src = await pg.evaluate("(document.querySelector('.player-frame--yandex')||{}).src||''")
        ok('Яндекс: альбом «Младшая сестра» в плеере', src.endswith('/iframe/album/8886142'), src)
        await pg.locator('.jcard-track:not(.jcard-track--album):has-text("Младшая сестра")').first.click(); await pg.wait_for_timeout(1000)
        src = await pg.evaluate("(document.querySelector('.player-frame--yandex')||{}).src||''")
        ok('Яндекс: трек «Младшая сестра» в плеере', src.endswith('/album/8886142/track/58507005'), src)
        await pg.locator('.jcard-track--album').nth(3).click(); await pg.wait_for_timeout(1000)
        ok('Яндекс: без ID - кнопка «Открыть в Яндекс Музыке»', await pg.locator('.player-card--yandex').count()==1)
        await pg.click('.svc-btn--spotify'); await pg.wait_for_selector('.player iframe', timeout=15000); await pg.wait_for_timeout(500)
        src = await pg.evaluate("(document.querySelector('.player iframe')||{}).src||''")
        ok('Spotify: альбом MISS', '2umHPKn2Mggn9RUqT8beQy' in src, src[:60])
        await pg.locator('.jcard-track:has-text("Я боюсь людей")').click(); await pg.wait_for_timeout(1200)
        src = await pg.evaluate("(document.querySelector('.player iframe')||{}).src||''")
        ok('Spotify: трек без своего ID открывается в плеере альбома + пояснение', '2umHPKn2Mggn9RUqT8beQy' in src and await pg.locator('.player-inalbum').count()==1)
        await pg.reload(); await pg.wait_for_timeout(3000)
        ok('выбор сервиса запоминается', await pg.locator('.svc-btn--spotify.is-on').count()==1)
        for era in ['cuterock','lovesongs','prologue']:
            await pg.goto(f'http://localhost:4173/#/music?era={era}'); await pg.wait_for_timeout(1500)
            ok(f'{era}: подсказка не наезжает на название', (await pg.evaluate(OVL)) in ('ok','нет'), await pg.evaluate(OVL))
        await pg.evaluate("window.dispatchEvent(new Event('blur'))")
        m = await b.new_page(viewport={'width':375,'height':740}); m.on('pageerror', lambda e: errs.append(str(e)))
        await m.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'all'})) } catch(e) {}")
        await m.goto('http://localhost:4173/#/music?era=now&track=Million%20Dollar%20Baby'); await m.wait_for_timeout(3000)
        ok('телефон: без переполнения и без наезда', await m.evaluate('document.documentElement.scrollWidth - innerWidth')<=1 and (await m.evaluate(OVL)) in ('ok','нет'), await m.evaluate(OVL))
        await m.screenshot(path='/tmp/m3b.png')
        print('errors', errs, '| итого', sum(R), 'из', len(R)); await b.close()
asyncio.run(main())
