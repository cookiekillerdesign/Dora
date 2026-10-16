import asyncio, os, time
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        c = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=3, is_mobile=True, has_touch=True); pg = await c.new_page()
        await pg.add_init_script("window.__f=0; (function t(){ window.__f++; requestAnimationFrame(t) })()")
        t0=time.time(); await pg.goto('http://localhost:4173/')
        for i in range(8):
            await pg.wait_for_timeout(5000)
            st = await pg.evaluate("({frames: window.__f, pre: !!document.querySelector('.preloader'), bar: document.querySelector('.pl-bar')?.style.transform || '-', canvas: document.querySelector('.era-canvas')?.width})")
            print(f'{time.time()-t0:5.1f}с', st, flush=True)
            if not st['pre']: break
        await b.close()
asyncio.run(main())
