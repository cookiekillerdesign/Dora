import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def goto_ch(pg, i):
    # середина паузы главы i (1..6): лента из 8 панелей, переезд 1, пауза 0.7
    T = 7 + 6 * 0.7
    mid = (i + (i - 1) * 0.7 + 0.35) / T
    await pg.evaluate(f"window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * {mid})")

async def settle(pg, X, limit=9000):
    prev=None; same=0; t=0
    while t<limit:
        await pg.wait_for_timeout(400); t+=400
        v = await pg.evaluate(X)
        same = same+1 if v==prev else 0; prev=v
        if same>=3 and abs(v-round(v))<0.01: return v
    return prev

X="(()=>{const m=getComputedStyle(document.querySelector('.h-track')).transform; return m==='none'?0:Math.round(-parseFloat(m.split(',')[4])/innerWidth*100)/100})()"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2800)
        res=[]
        for run in range(3):
            await goto_ch(pg, 5); await pg.wait_for_timeout(2400)
            await goto_ch(pg, 2); await pg.wait_for_timeout(2400)
            await pg.mouse.wheel(0,120); await pg.wait_for_timeout(1500)
            a = await pg.evaluate(X)
            await pg.mouse.wheel(0,900)
            f = await settle(pg, X)
            await pg.mouse.wheel(0,-900)
            r = await settle(pg, X)
            res.append((a,f,r))
        print('пауза / вперёд / назад:', res, 'ожидается (2, 3, 2)')
        await b.close()
asyncio.run(main())
