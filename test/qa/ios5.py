import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        c = await b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True); m = await c.new_page()
        await m.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await m.goto('http://localhost:4173/'); await m.wait_for_timeout(4000)
        print('обложка: фильтр логотипа', await m.evaluate("getComputedStyle(document.querySelector('.cover-jelly img')).filter"), '| блик', await m.evaluate("getComputedStyle(document.querySelector('.cover-shine')).display"))
        H = await m.evaluate('document.documentElement.scrollHeight-innerHeight')
        for i,tag in [(2,'sis'),(4,'miss')]:
            await m.evaluate(f'document.documentElement.style.scrollSnapType="none"; window.scrollTo(0,{H}*{(i+(i-1)*0.7+0.35)/11.2})'); await m.wait_for_timeout(3000)
            await m.screenshot(path=f'/tmp/i5_{tag}.png')
        print('MISS: надпись влезает', await m.evaluate("(()=>{const r=document.querySelector('.miss-title').getBoundingClientRect(); const p=document.querySelector('.panel--miss').getBoundingClientRect(); return Math.round(r.right-p.left) + ' из ' + Math.round(p.width)})()"))
        await m.evaluate('window.scrollTo(0,0)'); await m.wait_for_timeout(800)
        await m.tap('.nav-burger'); await m.wait_for_timeout(1200); await m.screenshot(path='/tmp/i5_menu.png')
        await m.tap('.nav-burger'); await m.wait_for_timeout(600)
        await m.goto('http://localhost:4173/news'); await m.wait_for_timeout(2500); await m.screenshot(path='/tmp/i5_news.png')
        d = await b.new_page(viewport={'width':1440,'height':900})
        await d.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await d.goto('http://localhost:4173/#/news'); await d.wait_for_timeout(3000); await d.screenshot(path='/tmp/i5_newsd.png', full_page=True)
        await b.close()
asyncio.run(main())
