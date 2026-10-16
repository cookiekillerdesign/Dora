import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
PAGES=['/music','/video','/tour','/news','/merch','/merch/tee','/organizers','/cookies']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4000)
        clipped = await pg.evaluate("[...document.querySelectorAll('.cover-art-title')].filter(e=>e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.parentElement.clientHeight).map(e=>e.textContent)")
        print('названия обложек обрезаны:', clipped or 'нет')
        for i,r in enumerate(PAGES):
            await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(1800); await pg.screenshot(path=f'/tmp/vd{i}.png')
        m = await b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True); mp = await m.new_page()
        await mp.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await mp.goto('http://localhost:4173/'); await mp.wait_for_timeout(4000)
        for i,r in enumerate(PAGES):
            await mp.goto('http://localhost:4173/#'+r); await mp.wait_for_timeout(1800); await mp.screenshot(path=f'/tmp/vm{i}.png')
        await b.close()
asyncio.run(main())
