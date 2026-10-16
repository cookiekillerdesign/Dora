import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h in [(390,844),(320,568)]:
            c = await b.new_context(viewport={'width':w,'height':h}, is_mobile=True, has_touch=True); m = await c.new_page(); errs=[]; m.on('pageerror', lambda e: errs.append(str(e)))
            await m.goto('http://localhost:4173/')
            gone=None
            for t in range(1,30):
                await m.wait_for_timeout(200)
                if not await m.evaluate("!!document.querySelector('.preloader')"): gone=t*200; break
            await m.wait_for_timeout(1500)
            o = await m.evaluate("getComputedStyle(document.querySelector('.cover-jelly')).opacity")
            print(f'{w}x{h}: заставка ушла через {gone} мс | логотип виден: {o} | errors {errs}')
            if w==390: await m.screenshot(path='/tmp/cv3.png')
            await c.close()
        await b.close()
asyncio.run(main())
