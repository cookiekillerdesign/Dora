import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
S="""(()=>({pre: !!document.querySelector('.preloader'), preY: document.querySelector('.preloader') ? getComputedStyle(document.querySelector('.preloader')).transform : '-', jellyT: getComputedStyle(document.querySelector('.cover-jelly')).transform.slice(0,40), jellyO: getComputedStyle(document.querySelector('.cover-jelly')).opacity, track: Math.round(document.querySelector('.h-track').getBoundingClientRect().left), scrollY: Math.round(scrollY), navVisible: !!document.querySelector('.nav') && getComputedStyle(document.querySelector('.nav')).visibility, bodyText: document.body.innerText.length}))()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type=='error' and errs.append(m.text[:200]))
        await pg.goto('http://localhost:4173/')
        import time
        prev=0
        for t in [200, 400, 600, 800, 1000, 1400, 2200]:
            await pg.wait_for_timeout(t-prev); prev=t; print(t, await pg.evaluate(S))
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H}*{0.5/11.2})'); await pg.wait_for_timeout(4000)
        print('после прокрутки:', await pg.evaluate(S), '| WebGL потерян:', await pg.evaluate("(()=>{const c=document.querySelector('.era-canvas'); const g=c.getContext('webgl'); return g?g.isContextLost():'нет контекста'})()"))
        await pg.screenshot(path='/tmp/cv2.png')
        print('errors', errs); await b.close()
asyncio.run(main())
