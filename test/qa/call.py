import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2600)
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H}*{(5+4*0.7+0.35)/11.2})'); await pg.wait_for_timeout(3500)
        await pg.locator('.call-btn--yes').dispatch_event('click')
        seen=[]
        for i in range(16):
            await pg.wait_for_timeout(500); seen.append(await pg.locator('.call-status').inner_text())
            if seen[-1] not in ('00:00','00:01') and 'любовь' in await pg.locator('.call-question').inner_text(): break
        print('ЗВОНОК: таймер', seen[-1], '| вопрос:', await pg.locator('.call-question').inner_text(), '| через', (i+1)*0.5, 'с', '| PASS' if seen[-1] not in ('00:00',) else '| FAIL', errs)
        await b.close()
asyncio.run(main())
