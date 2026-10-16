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
        ctx = await b.new_context(viewport={'width':1440,'height':900}, permissions=['clipboard-read','clipboard-write'])
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2800)
        await goto_ch(pg, 6); await pg.wait_for_timeout(1200)
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H})'); await pg.wait_for_timeout(3500)
        await pg.screenshot(path='/tmp/o_outro.png')
        print('ссылок в финале:', await pg.locator('.panel--outro .outro-link').count(), '| фото:', await pg.locator('.panel--outro .ep--outro').count(), '| соцсети:', await pg.locator('.panel--outro .soc').count())
        await pg.goto('http://localhost:4173/#/organizers'); await pg.wait_for_timeout(2200)
        await pg.screenshot(path='/tmp/o_gate.png')
        await pg.keyboard.type('1111'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/o_kit.png', full_page=True)
        await pg.locator('.kit-bio .kit-copy').click(); await pg.wait_for_timeout(300)
        clip = await pg.evaluate('navigator.clipboard.readText()')
        print('копирование пресс-релиза:', clip[:40], '| кнопка:', await pg.locator('.kit-bio .kit-copy').inner_text())
        m = await b.new_page(viewport={'width':375,'height':740})
        await m.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await m.goto('http://localhost:4173/#/organizers'); await m.wait_for_timeout(2600)
        await m.screenshot(path='/tmp/o_mgate.png')
        await m.keyboard.type('1111'); await m.keyboard.press('Enter'); await m.wait_for_timeout(1200)
        await m.screenshot(path='/tmp/o_mkit.png')
        print('переполнение моб.:', await m.evaluate('document.documentElement.scrollWidth - innerWidth'))
        print('errors', errs); await b.close()
asyncio.run(main())
