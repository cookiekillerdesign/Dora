import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(5000)
        ok = await pg.evaluate("Promise.all(['Caveat','Neucha','Rubik Dirt','Unbounded','Playfair Display','Great Vibes'].map(f=>document.fonts.load('32px \"'+f+'\"','Абв'))).then(r=>r.map(x=>x.length>0))")
        print('шрифты загружены (Caveat, Neucha, Rubik Dirt, Unbounded, Playfair, Great Vibes):', ok)
        await pg.screenshot(path='/tmp/f0.png')
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        for ch in [1,2,3,5]:
            await pg.evaluate(f'window.scrollTo(0,{H}*{(ch+(ch-1)*0.7+0.35)/11.2})'); await pg.wait_for_timeout(3200)
            await pg.screenshot(path=f'/tmp/f{ch}.png')
        await pg.goto('http://localhost:4173/#/merch'); await pg.wait_for_timeout(1800); await pg.screenshot(path='/tmp/fm.png')
        m = await b.new_page(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True)
        await m.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await m.goto('http://localhost:4173/#/tour'); await m.wait_for_timeout(3500)
        await m.tap('.nav-burger'); await m.wait_for_timeout(1300); await m.screenshot(path='/tmp/fmenu.png')
        print('errors', errs); await b.close()
asyncio.run(main())
