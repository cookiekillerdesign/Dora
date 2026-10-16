import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
X="(()=>{const m=getComputedStyle(document.querySelector('.h-track')).transform; return m==='none'?0:Math.round(-parseFloat(m.split(',')[4])/innerWidth*100)/100})()"
async def settle(pg, limit=9000):
    prev=None; same=0; t=0
    while t<limit:
        await pg.wait_for_timeout(400); t+=400
        v = await pg.evaluate(X); same = same+1 if v==prev else 0; prev=v
        if same>=3: return v
    return prev
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width':390,'height':844}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        cdp = await ctx.new_cdp_session(pg)
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(3500)
        print('точки привязки:', await pg.evaluate("document.querySelectorAll('.tape-snaps i').length"), '| режим:', await pg.evaluate("getComputedStyle(document.documentElement).scrollSnapType"))
        async def swipe(dy, steps=4, pause=8):
            y0 = 760 if dy>0 else 120
            await cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[{'x':195,'y':y0}]})
            for k in range(1,steps+1):
                await cdp.send('Input.dispatchTouchEvent', {'type':'touchMove','touchPoints':[{'x':195,'y':y0-dy*k/steps}]}); await pg.wait_for_timeout(pause)
            await cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
        seq=[]
        for name,dy,st in [('быстрый флик вперёд',600,3),('ещё флик вперёд',600,3),('очень сильный флик',700,2),('флик назад',-600,3),('медленный короткий',120,8)]:
            before = await pg.evaluate(X)
            await swipe(dy, st); v = await settle(pg)
            seq.append(f'{name}: {before} -> {v}')
        print('\n'.join(seq)); print('errors', errs)
        await b.close()
asyncio.run(main())
