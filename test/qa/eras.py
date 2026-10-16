import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def goto_ch(pg, i):
    # середина паузы главы i (1..6): лента из 8 панелей, переезд 1, пауза 0.7
    T = 7 + 6 * 0.7
    mid = (i + (i - 1) * 0.7 + 0.35) / T
    await pg.evaluate(f"window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * {mid})")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2800)
        for i in range(6):
            await goto_ch(pg, i+1); await pg.wait_for_timeout(3200)
            await pg.screenshot(path=f'/tmp/e{i}.png')
        print('errors', errs)
        await b.close()
asyncio.run(main())
