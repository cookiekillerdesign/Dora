import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def goto_ch(pg, i):
    # середина паузы главы i (1..6): лента из 8 панелей, переезд 1, пауза 0.7
    T = 7 + 6 * 0.7
    mid = (i + (i - 1) * 0.7 + 0.35) / T
    await pg.evaluate(f"window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * {mid})")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width':375,'height':740}, has_touch=True, is_mobile=True)
        m = await ctx.new_page(); errs=[]; m.on('pageerror', lambda e: errs.append(str(e)))
        await m.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await m.goto('http://localhost:4173/'); await m.wait_for_timeout(2800)
        H = await m.evaluate('document.documentElement.scrollHeight-innerHeight')
        shots=[]
        # точные середины пауз
        T=7*1+6*0.7
        mids=[ (k*1+(k-1)*0.7+0.35)/T for k in range(1,7)]
        for i,mid in enumerate(mids):
            await m.evaluate(f'window.scrollTo(0,{H}*{mid})'); await m.wait_for_timeout(1800)
            await m.screenshot(path=f'/tmp/m{i}.png')
            if i==4:
                ws = await m.evaluate("[...document.querySelectorAll('.call-actions .call-btn')].map(b=>Math.round(b.getBoundingClientRect().width))")
                print('ширины кнопок звонка (тел):', ws)
            if i==1:
                await m.tap('.panel--sister .era-clip-tab'); await m.wait_for_timeout(900)
                await m.screenshot(path='/tmp/m1open.png')
                print('вырезка открыта:', await m.locator('.panel--sister .era-clip.is-open').count()==1)
                await m.touchscreen.tap(40, 190); await m.wait_for_timeout(700)
                print('закрылась по тапу мимо:', await m.locator('.era-clip.is-open').count()==0)
        d = await b.new_page(viewport={'width':1440,'height':900})
        await d.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await d.goto('http://localhost:4173/'); await d.wait_for_timeout(2800)
        await goto_ch(d, 5); await d.wait_for_timeout(2600)
        ws = await d.evaluate("[...document.querySelectorAll('.call-actions .call-btn')].map(b=>Math.round(b.getBoundingClientRect().width))")
        print('ширины кнопок звонка (десктоп):', ws)
        await d.screenshot(path='/tmp/dlove.png')
        print('errors', errs)
        await b.close()
asyncio.run(main())
