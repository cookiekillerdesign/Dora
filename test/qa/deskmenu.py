import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
X="(()=>{const m=getComputedStyle(document.querySelector('.h-track')).transform; return m==='none'?0:Math.round(-parseFloat(m.split(',')[4])/innerWidth*100)/100})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1000,'height':800}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2800)
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H}*{(3+2*0.7+0.35)/11.2})'); await pg.wait_for_timeout(3500)
        y0 = await pg.evaluate('Math.round(scrollY)'); x0 = await pg.evaluate(X)
        await pg.click('.nav-burger'); await pg.wait_for_timeout(900)
        await pg.mouse.wheel(0, 800); await pg.wait_for_timeout(900)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(1800)
        y1 = await pg.evaluate('Math.round(scrollY)'); x1 = await pg.evaluate(X)
        print('ДЕСКТОП-МЕНЮ: колесо по меню не сдвигает ленту ->', 'PASS' if abs(y1-y0)<=2 and abs(x1-x0)<0.02 else 'FAIL', f'{y0}→{y1}, {x0}→{x1}')
        await pg.mouse.wheel(0, 900); await pg.wait_for_timeout(3000)
        print('ДЕСКТОП-МЕНЮ: после закрытия колесо листает ->', 'PASS' if await pg.evaluate('Math.round(scrollY)')>y1 else 'FAIL', '| errors', errs)
        await b.close()
asyncio.run(main())
