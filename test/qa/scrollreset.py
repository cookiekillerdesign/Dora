import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def run(b, mobile):
    ctx = await b.new_context(viewport={'width':390,'height':844} if mobile else {'width':1440,'height':900}, is_mobile=mobile, has_touch=mobile)
    pg = await ctx.new_page()
    await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
    tag = 'телефон' if mobile else 'компьютер'
    async def go_link(selector):
        await pg.locator(selector).first.dispatch_event('click'); await pg.wait_for_timeout(1500)
        return round(await pg.evaluate('scrollY'))
    await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(3500)
    H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
    await pg.evaluate(f'document.documentElement.style.scrollSnapType="none"; window.scrollTo(0,{H}*0.6)'); await pg.wait_for_timeout(2000)
    if mobile:
        await pg.tap('.nav-burger'); await pg.wait_for_timeout(900)
        y = await go_link('.menu-link[href*="tour"]')
    else:
        y = await go_link('.nav-links a[href*="tour"]')
    print(f'{tag}: с середины главной -> Тур, прокрутка {y}')
    await pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); await pg.wait_for_timeout(1200)
    y = await go_link('.foot-legal a[href*="legal"]')
    print(f'{tag}: из подвала Тура -> Сведения о владельце, прокрутка {y}')
    await pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); await pg.wait_for_timeout(1200)
    y = await go_link('.foot-legal a[href*="cookies"]')
    print(f'{tag}: из подвала документа -> Cookie, прокрутка {y}')
    await pg.goto('http://localhost:4173/#/merch'); await pg.wait_for_timeout(1500)
    await pg.evaluate('window.scrollTo(0, 900)'); await pg.wait_for_timeout(1000)
    y = await go_link('.sticker')
    print(f'{tag}: из середины мерча -> товар, прокрутка {y}')
    if mobile:
        await pg.goto('http://localhost:4173/#/tour'); await pg.wait_for_timeout(1500)
        await pg.evaluate('window.scrollTo(0, 700)'); await pg.wait_for_timeout(800)
        await pg.tap('.nav-burger'); await pg.wait_for_timeout(800); await pg.tap('.nav-burger'); await pg.wait_for_timeout(900)
        print(f'{tag}: меню открыли и закрыли на той же странице, прокрутка {round(await pg.evaluate("scrollY"))} (должна остаться 700)')
    await ctx.close()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        await run(b, False); await run(b, True)
        await b.close()
asyncio.run(main())
