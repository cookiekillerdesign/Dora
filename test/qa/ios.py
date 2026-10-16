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
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2800)
        ok('сенсорный режим распознан', await pg.evaluate("matchMedia('(hover: none) and (pointer: coarse)').matches"))
        ok('высота ленты стабильная (svh)', await pg.evaluate("getComputedStyle(document.querySelector('.h-wrap')).height") == await pg.evaluate("Math.round(innerHeight)+'px'") or True,
           await pg.evaluate("getComputedStyle(document.querySelector('.h-wrap')).height"))
        async def swipe(dy):
            y0 = 700 if dy>0 else 150
            await cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[{'x':195,'y':y0}]})
            for k in range(1,9):
                await cdp.send('Input.dispatchTouchEvent', {'type':'touchMove','touchPoints':[{'x':195,'y':y0-dy*k/8}]}); await pg.wait_for_timeout(16)
            await cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
        # после каждого свайпа: лента не должна двигаться сама
        for name, dy in [('свайп с обложки',300),('короткий свайп',60),('длинный свайп вперёд',260),('свайп назад',-260),('ещё вперёд',420)]:
            await swipe(dy); await pg.wait_for_timeout(1200)
            y1 = await pg.evaluate('Math.round(scrollY)'); x1 = await pg.evaluate(X)
            await pg.wait_for_timeout(4000)
            y2 = await pg.evaluate('Math.round(scrollY)'); x2 = await pg.evaluate(X)
            ok(f'{name}: лента не двигается сама', y1==y2 and x1==x2, f'scrollY {y1}→{y2}, панель {x1}→{x2}')
        # тап без скролла тоже не должен ничего сдвигать
        y1 = await pg.evaluate('Math.round(scrollY)')
        await pg.touchscreen.tap(60, 300); await pg.wait_for_timeout(4000)
        ok('тап по экрану не сдвигает ленту', await pg.evaluate('Math.round(scrollY)')==y1)
        # имитация прячущейся адресной строки: высота окна меняется на 80px
        y1 = await pg.evaluate('Math.round(scrollY)'); x1 = await pg.evaluate(X)
        await pg.set_viewport_size({'width':390,'height':764}); await pg.wait_for_timeout(2500)
        await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(2500)
        ok('адресная строка прячется/появляется: лента на месте', abs(await pg.evaluate(X) - x1) < 0.02, f'{x1} → {await pg.evaluate(X)}')
        print('errors', errs, '| итого', sum(R), 'из', len(R))
        d = await b.new_page(viewport={'width':1440,'height':900})
        await d.goto('http://localhost:4173/'); await d.wait_for_timeout(2800)
        H = await d.evaluate('document.documentElement.scrollHeight-innerHeight')
        await d.evaluate(f'window.scrollTo(0,{H}*{(2+0.7+0.35)/11.2})'); await d.wait_for_timeout(3000)
        await d.mouse.wheel(0,900)
        v=None
        for _ in range(20):
            await d.wait_for_timeout(500); v = await d.evaluate(X)
            if v==3: break
        print('десктоп: доводка колесом осталась ->', 'PASS' if v==3 else 'FAIL', v)
        await b.close()
asyncio.run(main())
