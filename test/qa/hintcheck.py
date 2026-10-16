import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'all'})); localStorage.setItem('dora-player','yandex') } catch(e) {}")
        await pg.goto('http://localhost:4173/#/music?era=now&track=Million%20Dollar%20Baby'); await pg.wait_for_timeout(3000)
        print('нет плеера: подсказки нет ->', await pg.locator('.play-hint').count()==0, '| кнопок Яндекса', await pg.locator('a.svc-open').count())
        await pg.goto('http://localhost:4173/#/music?era=sister'); await pg.wait_for_timeout(2000)
        print('есть плеер: подсказка есть ->', await pg.locator('.play-hint').count()==1, '| кнопок Яндекса', await pg.locator('a.svc-open').count())
        await b.close()
asyncio.run(main())
