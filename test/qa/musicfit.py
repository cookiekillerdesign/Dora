import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h in [(1903,914),(1440,900),(1366,768),(1280,720),(1024,768),(1280,640)]:
            pg = await b.new_page(viewport={'width':w,'height':h})
            await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'all'})); localStorage.setItem('dora-player','spotify') } catch(e) {}")
            await pg.goto('http://localhost:4173/#/music'); await pg.wait_for_timeout(3500)
            r = await pg.evaluate("""(()=>{const j=document.querySelector('.jcard'), side=document.querySelector('.stage-side').getBoundingClientRect();
              return {pageScroll: document.documentElement.scrollHeight - innerHeight, jcardScrolls: j.scrollHeight > j.clientHeight+1, jcardOverflow: getComputedStyle(j).overflowY,
                      sideBottom: Math.round(side.bottom), h: innerHeight, lenisPrevent: j.hasAttribute('data-lenis-prevent')}})()""")
            jb = await pg.locator('.jcard').bounding_box()
            await pg.mouse.move(jb['x']+jb['width']/2, jb['y']+jb['height']/2)
            for _ in range(5): await pg.mouse.wheel(0, 300); await pg.wait_for_timeout(150)
            await pg.wait_for_timeout(800)
            st = await pg.evaluate("({list: Math.round(document.querySelector('.jcard').scrollTop), page: Math.round(scrollY)})")
            await pg.mouse.move(jb['x']+jb['width']+300, 400)
            for _ in range(3): await pg.mouse.wheel(0, 400); await pg.wait_for_timeout(150)
            await pg.wait_for_timeout(800)
            st2 = round(await pg.evaluate('scrollY'))
            ok = (r['pageScroll']<=1 and r['sideBottom']<=h and st['list']>0 and st['page']==0 and st2==0) if h>=700 else (r['pageScroll']>0)  # низкое окно: обычная прокрутка страницы
            print(f"{w}x{h}: прокрутка страницы {r['pageScroll']}px, низ плеера {r['sideBottom']}/{h}, колесо над списком: список {st['list']}px / страница {st['page']}px, колесо над плеером: страница {st2}px ->", 'PASS' if ok else 'FAIL')
            await pg.close()
        await b.close()
asyncio.run(main())
