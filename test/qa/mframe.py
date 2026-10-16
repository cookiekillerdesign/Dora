import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        c = await b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True); m = await c.new_page()
        await m.goto('http://localhost:4173/'); await m.wait_for_timeout(3500)
        print('рамки на телефоне:', await m.evaluate("[...document.querySelectorAll('.panel .ep .ep-inner')].map(e=>e.closest('.ep').className.split(' ').find(c=>c.startsWith('ep--'))+' '+getComputedStyle(e).paddingTop).join(', ')"))
        H = await m.evaluate('document.documentElement.scrollHeight-innerHeight')
        await m.evaluate(f'document.documentElement.style.scrollSnapType="none"; window.scrollTo(0,{H}*{(5+4*0.7+0.35)/11.2})'); await m.wait_for_timeout(3000)
        await m.screenshot(path='/tmp/f_mob.png')
        d = await b.new_page(viewport={'width':1440,'height':900})
        await d.goto('http://localhost:4173/'); await d.wait_for_timeout(3000)
        print('рамка на компьютере (пролог):', await d.evaluate("getComputedStyle(document.querySelector('.ep--prologue .ep-inner')).paddingTop"))
        await b.close()
asyncio.run(main())
