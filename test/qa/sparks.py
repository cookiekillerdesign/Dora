import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4000)
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H}*{(4+3*0.7+0.35)/11.2})'); await pg.wait_for_timeout(3500)
        await pg.evaluate("window.__sp=0; window.__max=0; new MutationObserver(()=>{const n=document.querySelectorAll('.fx-spark').length; window.__max=Math.max(window.__max,n)}).observe(document.body,{childList:true,subtree:true}); new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.classList&&n.classList.contains('fx-spark')) __sp++ }))).observe(document.body,{childList:true,subtree:true})")
        for i in range(40):
            await pg.mouse.move(300+i*20, 400+(i%5)*12); await pg.wait_for_timeout(25)
        await pg.wait_for_timeout(300)
        f = await pg.evaluate("getComputedStyle(document.querySelector('.fx-spark')||document.body).filter")
        print('MISS: блёстки появляются ->', 'PASS' if await pg.evaluate('__sp')>10 else 'FAIL', await pg.evaluate('__sp'), '| максимум одновременно:', await pg.evaluate('__max'), '(лимит 60) | фильтр у блёстки:', f)
        print('errors', errs); await b.close()
asyncio.run(main())
