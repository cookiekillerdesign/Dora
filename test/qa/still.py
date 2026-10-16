import asyncio, os, hashlib
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
H="document.querySelector('.turntable').toDataURL()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'all'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/#/music'); await pg.wait_for_timeout(3500)
        h = lambda s: hashlib.md5(s.encode()).hexdigest()[:8]
        a = h(await pg.evaluate(H)); await pg.wait_for_timeout(1500); b2 = h(await pg.evaluate(H))
        print('в покое холст не меняется ->', 'PASS' if a==b2 else 'FAIL', a, b2)
        await pg.wait_for_selector('.player iframe', timeout=15000)
        await pg.evaluate("document.querySelector('.player iframe').focus(); window.dispatchEvent(new Event('blur'))"); await pg.wait_for_timeout(1500)
        print('  подсказка видна:', await pg.locator('.play-hint').count(), '| в фокусе:', await pg.evaluate("document.activeElement.tagName"))
        c = h(await pg.evaluate(H)); await pg.wait_for_timeout(600); d = h(await pg.evaluate(H))
        print('при игре холст меняется (крутится) ->', 'PASS' if c!=d else 'FAIL', c, d)
        await b.close()
asyncio.run(main())
