import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
X="(()=>{const m=getComputedStyle(document.querySelector('.h-track')).transform; return m==='none'?0:Math.round(-parseFloat(m.split(',')[4])/innerWidth*100)/100})()"
R=[]
def ok(n,c,e=''): R.append(c); print('PASS' if c else 'FAIL', n, e, flush=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width':390,'height':844}, has_touch=True, is_mobile=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1')
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        cdp = await ctx.new_cdp_session(pg)
        async def swipe(dy, x=195, y0=None, steps=8):
            y0 = y0 or (700 if dy>0 else 150)
            await cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[{'x':x,'y':y0}]})
            for k in range(1,steps+1):
                await cdp.send('Input.dispatchTouchEvent', {'type':'touchMove','touchPoints':[{'x':x,'y':y0-dy*k/steps}]}); await pg.wait_for_timeout(16)
            await cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2800)
        ok('Lenis на телефоне не запущен', not await pg.evaluate("document.documentElement.classList.contains('lenis')"))
        # 1 буквы обложки после касания по ним
        b1 = await pg.locator('.cover-l').nth(1).bounding_box()
        await swipe(40, x=int(b1['x']+b1['width']/2), y0=int(b1['y']+b1['height']/2)); await pg.wait_for_timeout(1500)
        tr = await pg.evaluate("[...document.querySelectorAll('.cover-l')].map(l=>getComputedStyle(l).transform)")
        ok('буквы обложки не застревают после касания', all(t in ('none','matrix(1, 0, 0, 1, 0, 0)') for t in tr), tr[:2])
        await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(800)
        # 2 меню не сдвигает ленту
        await swipe(320); await pg.wait_for_timeout(1500)
        y0 = await pg.evaluate('Math.round(scrollY)'); x0 = await pg.evaluate(X)
        await pg.tap('.nav-burger'); await pg.wait_for_timeout(1000)
        await swipe(300, y0=600); await pg.wait_for_timeout(500); await swipe(-300, y0=300); await pg.wait_for_timeout(500); await swipe(250, y0=600); await pg.wait_for_timeout(800)
        await pg.tap('.nav-burger'); await pg.wait_for_timeout(1500)
        y1 = await pg.evaluate('Math.round(scrollY)'); x1 = await pg.evaluate(X)
        ok('меню: свайпы по меню не сдвигают ленту под ним', abs(y1-y0)<=2 and abs(x1-x0)<0.02, f'scrollY {y0}→{y1}, панель {x0}→{x1}')
        ok('меню: после закрытия body свободен', await pg.evaluate("document.body.style.position===''"))
        await swipe(200); await pg.wait_for_timeout(1500)
        ok('меню: после закрытия страница листается', await pg.evaluate('Math.round(scrollY)') > y1)
        # 3 стразы MISS не сыплются от пальца
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H}*{(4+3*0.7+0.35)/11.2})'); await pg.wait_for_timeout(3500)
        await pg.evaluate("window.__sp=0; new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.classList&&n.classList.contains('fx-spark')) __sp++ }))).observe(document.body,{childList:true,subtree:true})")
        await swipe(60, y0=500); await pg.wait_for_timeout(800)
        ok('MISS: при листании пальцем стразы не сыплются', await pg.evaluate('__sp')==0, await pg.evaluate('__sp'))
        # 4 без размытых подложек
        bf = await pg.evaluate("[...document.querySelectorAll('.miss-card,.call,.now-chip')].map(e=>getComputedStyle(e).backdropFilter||getComputedStyle(e).webkitBackdropFilter)")
        ok('размытые подложки на телефоне выключены', all(v in ('none','') for v in bf), set(bf))
        # 5 лента не двигается сама после свайпов
        for name, dy in [('длинный вперёд',260),('назад',-260),('с инерцией',500)]:
            await swipe(dy, steps=4 if name=='с инерцией' else 8); await pg.wait_for_timeout(1200)
            ya = await pg.evaluate('Math.round(scrollY)'); xa = await pg.evaluate(X)
            await pg.wait_for_timeout(3500)
            yb = await pg.evaluate('Math.round(scrollY)'); xb = await pg.evaluate(X)
            ok(f'свайп {name}: лента не двигается сама', ya==yb and xa==xb, f'{ya}→{yb}, {xa}→{xb}')
        print('errors', errs, '| итого', sum(R), 'из', len(R))
        await b.close()
asyncio.run(main())
